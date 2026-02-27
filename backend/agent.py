"""
FlashGap AI — Watcher Bot (agent.py)

Continuously polls two DEXs for price gaps, asks GPT for a confidence
score, and triggers the on-chain FlashGap arbitrage when conditions are met.
"""

import time
import json
import datetime
from web3 import Web3
from openai import OpenAI

from config import (
    BSC_RPC, DEPLOYER_PRIVATE_KEY, FLASHGAP_CONTRACT,
    PANCAKE_ROUTER, BISWAP_ROUTER, WBNB, BUSD,
    ROUTER_ABI, FLASHGAP_ABI,
    OPENAI_API_KEY, AI_MODEL,
    CONFIDENCE_THRESHOLD, MIN_PROFIT_USD,
    POLL_INTERVAL_SEC, PRICE_HISTORY_LEN, BORROW_AMOUNT_WEI,
)
from greenfield import upload_log

# ── Web3 setup ──────────────────────────────────────────
w3 = Web3(Web3.HTTPProvider(BSC_RPC))
account = w3.eth.account.from_key(DEPLOYER_PRIVATE_KEY)

router_pancake = w3.eth.contract(address=Web3.to_checksum_address(PANCAKE_ROUTER), abi=ROUTER_ABI)
router_biswap  = w3.eth.contract(address=Web3.to_checksum_address(BISWAP_ROUTER),  abi=ROUTER_ABI)
flashgap       = w3.eth.contract(address=Web3.to_checksum_address(FLASHGAP_CONTRACT), abi=FLASHGAP_ABI)

client = OpenAI(api_key=OPENAI_API_KEY)

# ── Price history buffer ────────────────────────────────
price_history: list[dict] = []


def fetch_price(router, token_in: str, token_out: str, amount_in: int) -> float:
    """Return the quoted output amount as a float (in token_out units)."""
    path = [Web3.to_checksum_address(token_in), Web3.to_checksum_address(token_out)]
    try:
        amounts = router.functions.getAmountsOut(amount_in, path).call()
        return float(amounts[-1]) / 1e18
    except Exception as e:
        print(f"[WARN] Price fetch error: {e}")
        return 0.0


def get_ai_confidence(history: list[dict]) -> tuple[float, str]:
    """Ask GPT whether the current gap is a good arbitrage opportunity."""
    prompt = (
        "You are a DeFi arbitrage analyst. Given the following recent price-gap "
        "snapshots between PancakeSwap and BiSwap on BNB Chain, predict whether "
        "this gap will persist long enough for a profitable flash-swap arbitrage.\n\n"
        f"Data (latest {len(history)} ticks):\n"
        f"{json.dumps(history, indent=2)}\n\n"
        "Respond ONLY with valid JSON: {\"confidence\": <0.0-1.0>, \"reasoning\": \"<short text>\"}"
    )

    try:
        resp = client.chat.completions.create(
            model=AI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=200,
        )
        data = json.loads(resp.choices[0].message.content)
        return float(data["confidence"]), data.get("reasoning", "")
    except Exception as e:
        print(f"[WARN] AI call failed: {e}")
        return 0.0, str(e)


def execute_arbitrage():
    """Send the requestArbitrage tx on-chain."""
    print("⚡ Executing on-chain arbitrage...")
    tx = flashgap.functions.requestArbitrage(
        Web3.to_checksum_address(BUSD),
        Web3.to_checksum_address(WBNB),
        BORROW_AMOUNT_WEI,
        Web3.to_checksum_address(PANCAKE_ROUTER),
        Web3.to_checksum_address(BISWAP_ROUTER),
    ).build_transaction({
        "from": account.address,
        "nonce": w3.eth.get_transaction_count(account.address),
        "gas": 500_000,
        "gasPrice": w3.eth.gas_price,
    })

    signed = w3.eth.account.sign_transaction(tx, DEPLOYER_PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)
    return tx_hash.hex(), receipt.status


def main():
    print("=" * 60)
    print("  FlashGap AI — Watcher Bot Started")
    print("=" * 60)
    print(f"  RPC:        {BSC_RPC}")
    print(f"  Contract:   {FLASHGAP_CONTRACT}")
    print(f"  Pair:       BUSD → WBNB")
    print(f"  Poll every: {POLL_INTERVAL_SEC}s")
    print("=" * 60)

    while True:
        try:
            price_a = fetch_price(router_pancake, BUSD, WBNB, BORROW_AMOUNT_WEI)
            price_b = fetch_price(router_biswap,  BUSD, WBNB, BORROW_AMOUNT_WEI)

            gap_pct = abs(price_a - price_b) / max(price_a, price_b, 1e-18) * 100

            tick = {
                "ts": datetime.datetime.utcnow().isoformat(),
                "pancake": round(price_a, 6),
                "biswap":  round(price_b, 6),
                "gap_pct": round(gap_pct, 4),
            }
            price_history.append(tick)
            if len(price_history) > PRICE_HISTORY_LEN:
                price_history.pop(0)

            print(
                f"[{tick['ts']}] PCS={tick['pancake']:.6f}  BiSwap={tick['biswap']:.6f}  "
                f"Gap={tick['gap_pct']:.4f}%"
            )

            # ── AI gating ───────────────────────────────
            if len(price_history) >= 5 and gap_pct > 0.05:
                confidence, reasoning = get_ai_confidence(price_history)
                print(f"   🤖 AI Confidence: {confidence:.2%} — {reasoning}")

                if confidence >= CONFIDENCE_THRESHOLD and gap_pct > 0.1:
                    tx_hash, status = execute_arbitrage()
                    log = {
                        **tick,
                        "confidence": confidence,
                        "reasoning": reasoning,
                        "tx_hash": tx_hash,
                        "status": "success" if status == 1 else "reverted",
                    }
                    print(f"   ✅ TX: {tx_hash}  Status: {log['status']}")
                    upload_log(log)
                else:
                    print("   ⏳ Below threshold — skipping.")

        except KeyboardInterrupt:
            print("\n🛑 Bot stopped.")
            break
        except Exception as e:
            print(f"[ERROR] {e}")

        time.sleep(POLL_INTERVAL_SEC)


if __name__ == "__main__":
    main()
