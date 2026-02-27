"""
FlashGap AI — Full Agent (Steps 3-6) + Multi-Pair Scanner

1. Scans 6 pairs on BSC Mainnet (PancakeSwap + BiSwap)
2. Finds the pair with the BIGGEST price gap
3. AI (Groq/LLaMA) evaluates the best opportunity
4. If confidence >= 80% → sends TX to FlashGap contract on Testnet
5. Logs every decision to local JSON files
"""

import time
import json
import datetime
from web3 import Web3

from config import (
    BSC_RPC, BSC_TESTNET_RPC,
    PANCAKE_ROUTER, BISWAP_ROUTER,
    WBNB, BUSD,
    TESTNET_WBNB, TESTNET_BUSD, TESTNET_PANCAKE_ROUTER,
    ROUTER_ABI, FLASHGAP_ABI, SCAN_PAIRS,
    POLL_INTERVAL_SEC, BORROW_AMOUNT_WEI,
    OPENAI_API_KEY, AI_BASE_URL, AI_MODEL, CONFIDENCE_THRESHOLD,
    FLASHGAP_CONTRACT, DEPLOYER_PRIVATE_KEY,
)
from greenfield import upload_log

# ── Web3 connections ──────────────────────────────────────
w3_mainnet = Web3(Web3.HTTPProvider(BSC_RPC))
w3_testnet = Web3(Web3.HTTPProvider(BSC_TESTNET_RPC))

# ── AI setup ─────────────────────────────────────────────
ai_enabled = False
client = None

if OPENAI_API_KEY:
    try:
        from openai import OpenAI
        client = OpenAI(api_key=OPENAI_API_KEY, base_url=AI_BASE_URL)
        ai_enabled = True
        print(f"  ✅ AI connected: {AI_BASE_URL} ({AI_MODEL})")
    except ImportError:
        print("  ⚠️  openai package not installed. Run: pip install openai")
else:
    print("  ⚠️  No API key set. AI gating disabled (mock mode).")

# ── Contract setup ───────────────────────────────────────
contract = None
account = None
can_execute = False

if FLASHGAP_CONTRACT and DEPLOYER_PRIVATE_KEY:
    try:
        contract = w3_testnet.eth.contract(
            address=Web3.to_checksum_address(FLASHGAP_CONTRACT),
            abi=FLASHGAP_ABI,
        )
        account = w3_testnet.eth.account.from_key(DEPLOYER_PRIVATE_KEY)
        can_execute = True
        print(f"  ✅ Contract: {FLASHGAP_CONTRACT[:10]}...{FLASHGAP_CONTRACT[-6:]}")
        print(f"  ✅ Executor: {account.address[:10]}...{account.address[-6:]}")
    except Exception as e:
        print(f"  ⚠️  Contract setup failed: {e}")
else:
    print("  ⚠️  No contract/key — execution disabled.")


def check_connection():
    m_ok = w3_mainnet.is_connected()
    t_ok = w3_testnet.is_connected()
    print(f"  Mainnet  : {'✅ Connected' if m_ok else '❌ Failed'} (block {w3_mainnet.eth.block_number if m_ok else 'N/A'})")
    print(f"  Testnet  : {'✅ Connected' if t_ok else '❌ Failed'} (block {w3_testnet.eth.block_number if t_ok else 'N/A'})")
    return m_ok


def get_router(address):
    return w3_mainnet.eth.contract(
        address=Web3.to_checksum_address(address),
        abi=ROUTER_ABI,
    )


def fetch_price(router, token_in, token_out, amount_in):
    path = [Web3.to_checksum_address(token_in), Web3.to_checksum_address(token_out)]
    try:
        amounts = router.functions.getAmountsOut(amount_in, path).call()
        return float(amounts[-1]) / 1e18
    except Exception:
        return None


def scan_all_pairs(pancake, biswap):
    """
    Scan all configured pairs on both DEXs.
    Returns list of results sorted by gap (biggest first).
    """
    results = []

    for pair in SCAN_PAIRS:
        amount = BORROW_AMOUNT_WEI  # 1 token

        pcs_price = fetch_price(pancake, pair["token_in"], pair["token_out"], amount)
        bi_price = fetch_price(biswap, pair["token_in"], pair["token_out"], amount)

        if pcs_price is None or bi_price is None:
            continue

        gap = abs(pcs_price - bi_price) / max(pcs_price, bi_price, 1e-18) * 100

        # Determine direction
        if pcs_price < bi_price:
            direction = "Buy PCS → Sell BiSwap"
        else:
            direction = "Buy BiSwap → Sell PCS"

        results.append({
            "label": pair["label"],
            "token_in": pair["token_in"],
            "token_out": pair["token_out"],
            "pcs_price": pcs_price,
            "bi_price": bi_price,
            "gap_pct": gap,
            "direction": direction,
            "profitable": gap > 0.25,  # above flash fee
        })

    # Sort by gap descending
    results.sort(key=lambda x: x["gap_pct"], reverse=True)
    return results


def ask_ai(scan_results, price_history):
    if not ai_enabled:
        if not scan_results:
            return 0.0, "No data", None
        best = scan_results[0]
        mock_conf = min(best["gap_pct"] * 3, 0.95) if best["gap_pct"] > 0.1 else best["gap_pct"] * 2
        return mock_conf, f"Mock: {best['label']} gap={best['gap_pct']:.4f}%", best["label"]

    # Build multi-pair data for AI
    pairs_str = "\n".join([
        f"  {r['label']}: PCS={r['pcs_price']:.10f}, BiSwap={r['bi_price']:.10f}, Gap={r['gap_pct']:.4f}%, Direction={r['direction']}, Profitable={r['profitable']}"
        for r in scan_results
    ])

    history_str = ""
    if price_history:
        history_str = f"\n\nRecent history of best pair ({price_history[-1].get('best_pair', 'N/A')}):\n"
        history_str += json.dumps(price_history[-10:], indent=2)

    prompt = f"""You are an AI arbitrage evaluator for a DeFi flash-swap bot on BNB Chain.

CURRENT SCAN — 6 pairs across PancakeSwap vs BiSwap:
{pairs_str}

Flash swap fee: 0.25% (gap must exceed this for profit)
{history_str}

Evaluate:
1. Which pair has the best opportunity RIGHT NOW?
2. Is that gap > 0.25% (profitable after flash fee)?
3. Is the gap widening or stable?

Respond in EXACTLY this JSON format:
{{"confidence": 0.XX, "reasoning": "one sentence", "action": "execute" or "skip", "best_pair": "LABEL/LABEL"}}
"""

    try:
        response = client.chat.completions.create(
            model=AI_MODEL,
            messages=[
                {"role": "system", "content": "You are a quantitative DeFi analyst. Respond with valid JSON only."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=200,
        )
        raw = response.choices[0].message.content.strip()
        result = json.loads(raw)
        return (
            float(result.get("confidence", 0)),
            result.get("reasoning", "No reasoning"),
            result.get("best_pair", scan_results[0]["label"] if scan_results else None),
        )
    except json.JSONDecodeError:
        return 0.0, f"AI invalid JSON: {raw[:80]}", None
    except Exception as e:
        return 0.0, f"AI error: {str(e)[:80]}", None


def execute_on_chain(confidence, best_pair, gap):
    results = {"admin_tx": None, "arb_tx": None, "error": None}

    if not can_execute:
        results["error"] = "Execution disabled"
        return results

    try:
        print("         📡 Sending admin TX: setMinProfitBps(30)...")
        nonce = w3_testnet.eth.get_transaction_count(account.address)

        admin_tx = contract.functions.setMinProfitBps(30).build_transaction({
            "from": account.address,
            "nonce": nonce,
            "gas": 100_000,
            "gasPrice": w3_testnet.to_wei("10", "gwei"),
            "chainId": 97,
        })
        signed = account.sign_transaction(admin_tx)
        tx_hash = w3_testnet.eth.send_raw_transaction(signed.raw_transaction)
        receipt = w3_testnet.eth.wait_for_transaction_receipt(tx_hash, timeout=30)

        results["admin_tx"] = {
            "hash": tx_hash.hex(),
            "status": "✅ success" if receipt["status"] == 1 else "❌ failed",
            "block": receipt["blockNumber"],
            "gas_used": receipt["gasUsed"],
        }
        print(f"         ✅ Admin TX confirmed: {tx_hash.hex()[:16]}...")
        print(f"            Block: {receipt['blockNumber']} | Gas: {receipt['gasUsed']}")

    except Exception as e:
        results["admin_tx"] = {"error": str(e)[:100]}
        print(f"         ❌ Admin TX failed: {str(e)[:60]}")

    try:
        print("         📡 Attempting requestArbitrage (testnet)...")
        # Use 'pending' to avoid nonce collision with the admin TX just sent
        nonce = w3_testnet.eth.get_transaction_count(account.address, "pending")
        borrow_amt = w3_testnet.to_wei("0.001", "ether")

        arb_tx = contract.functions.requestArbitrage(
            Web3.to_checksum_address(TESTNET_BUSD),
            Web3.to_checksum_address(TESTNET_WBNB),
            borrow_amt,
            Web3.to_checksum_address(TESTNET_PANCAKE_ROUTER),
            Web3.to_checksum_address(TESTNET_PANCAKE_ROUTER),
            0,
        ).build_transaction({
            "from": account.address,
            "nonce": nonce,
            "gas": 500_000,
            "gasPrice": w3_testnet.to_wei("10", "gwei"),
            "chainId": 97,
        })
        signed = account.sign_transaction(arb_tx)
        tx_hash = w3_testnet.eth.send_raw_transaction(signed.raw_transaction)
        receipt = w3_testnet.eth.wait_for_transaction_receipt(tx_hash, timeout=30)

        status = "✅ Success" if receipt["status"] == 1 else "⚠️ Reverted (expected)"
        results["arb_tx"] = {
            "hash": tx_hash.hex(),
            "status": status,
            "block": receipt["blockNumber"],
            "gas_used": receipt["gasUsed"],
        }
        print(f"         {status}: {tx_hash.hex()[:16]}...")

    except Exception as e:
        results["arb_tx"] = {"error": str(e)[:100]}
        print(f"         ⚠️ Arb TX: {str(e)[:60]}")

    return results


def main():
    print("=" * 64)
    print("  ⚡ FlashGap AI — Multi-Pair Scanner + AI Agent")
    print("=" * 64)
    print(f"  Scanning : {len(SCAN_PAIRS)} pairs across PancakeSwap × BiSwap")
    print(f"  AI       : {AI_MODEL} ({'enabled' if ai_enabled else 'mock'})")
    print(f"  Contract : {'✅' if can_execute else '❌'}")
    print(f"  Threshold: {CONFIDENCE_THRESHOLD * 100}%")
    print()

    if not check_connection():
        print("\n❌ Cannot connect to BSC Mainnet.")
        return

    print()

    pancake = get_router(PANCAKE_ROUTER)
    biswap = get_router(BISWAP_ROUTER)

    # ── Initial scan ──────────────────────────────────────
    print("── Initial Pair Scan ──")
    initial = scan_all_pairs(pancake, biswap)
    for r in initial:
        flag = " 🔥" if r["profitable"] else ""
        print(f"  {r['label']:<12} PCS={r['pcs_price']:.8f}  BI={r['bi_price']:.8f}  Gap={r['gap_pct']:.4f}%{flag}")

    if initial:
        best = initial[0]
        print(f"\n  🏆 Best gap: {best['label']} ({best['gap_pct']:.4f}%) — {best['direction']}")

    # ── Contract state ────────────────────────────────────
    if can_execute:
        try:
            trades = contract.functions.totalTrades().call()
            profit = contract.functions.totalProfit().call()
            print(f"\n── Contract State ──")
            print(f"  totalTrades: {trades}  |  totalProfit: {profit}")
        except Exception as e:
            print(f"  ⚠️  Cannot read contract: {e}")

    print()
    print("=" * 64)
    print("  🔄 Live Multi-Pair Scanner + AI (Ctrl+C to stop)")
    print("=" * 64)
    print()

    price_history = []
    tick_count = 0
    ai_call_interval = 5
    executions = 0

    while True:
        try:
            now = datetime.datetime.now().strftime("%H:%M:%S")
            now_iso = datetime.datetime.utcnow().isoformat() + "Z"

            # ── Scan all pairs ────────────────────────────
            scan = scan_all_pairs(pancake, biswap)
            if not scan:
                print(f"  {now}  ⚠️ All pairs failed")
                time.sleep(POLL_INTERVAL_SEC)
                continue

            best = scan[0]
            tick_count += 1

            # Store history
            tick_data = {
                "time": now,
                "timestamp": now_iso,
                "best_pair": best["label"],
                "best_gap": round(best["gap_pct"], 6),
                "profitable": best["profitable"],
                "pairs_scanned": len(scan),
                "all_gaps": {r["label"]: round(r["gap_pct"], 6) for r in scan},
            }
            price_history.append(tick_data)
            if len(price_history) > 100:
                price_history = price_history[-50:]

            # ── AI evaluation (every 5th tick) ────────────
            if tick_count % ai_call_interval == 0 and len(price_history) >= 3:
                confidence, reasoning, ai_pick = ask_ai(scan, price_history)

                # Print scan summary
                print(f"  {now}  ── Scan ({len(scan)} pairs) ──")
                for r in scan[:4]:
                    flag = " 🔥" if r["profitable"] else ""
                    print(f"         {r['label']:<12} Gap={r['gap_pct']:.4f}%{flag}")
                print(f"         🤖 AI: {confidence*100:.1f}% — {reasoning}")

                if confidence >= CONFIDENCE_THRESHOLD:
                    print(f"         🔥 EXECUTING on {ai_pick or best['label']}")
                    executions += 1

                    tx_results = execute_on_chain(confidence, ai_pick or best["label"], best["gap_pct"])

                    log_entry = {
                        "timestamp": now_iso,
                        "tick": tick_count,
                        "execution_number": executions,
                        "scan": [{
                            "pair": r["label"],
                            "pcs": r["pcs_price"],
                            "bi": r["bi_price"],
                            "gap": r["gap_pct"],
                            "profitable": r["profitable"],
                        } for r in scan],
                        "ai": {
                            "model": AI_MODEL,
                            "confidence": confidence,
                            "reasoning": reasoning,
                            "best_pair": ai_pick,
                            "threshold": CONFIDENCE_THRESHOLD,
                        },
                        "transactions": tx_results,
                        "contract": FLASHGAP_CONTRACT,
                    }
                    log_path = upload_log(log_entry)
                    print(f"         📄 Logged: {log_path}")
                    print()
                else:
                    print(f"         → ⏳ skip ({confidence*100:.0f}% < {CONFIDENCE_THRESHOLD*100}%)")
                    print()
            else:
                # Regular tick — compact display
                profitable_count = sum(1 for r in scan if r["profitable"])
                print(f"  {now}  Best: {best['label']} Gap={best['gap_pct']:.4f}%  ({profitable_count}/{len(scan)} profitable)")

            time.sleep(POLL_INTERVAL_SEC)

        except KeyboardInterrupt:
            # Wrap KeyboardInterrupt in the loop for a clean exit
            print(f"\n\n🛑 Stopped after {tick_count} ticks, {executions} executions.")
            print(f"   {len(price_history)} scans collected.")
            break
        except Exception as e:
            print(f"  ⚠️  Error: {e}")
            time.sleep(POLL_INTERVAL_SEC)
            continue


if __name__ == "__main__":
    main()
