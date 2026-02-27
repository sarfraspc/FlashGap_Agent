"""
FlashGap AI — Price Watcher + AI Gating (Step 4)

Connects to BSC mainnet (read-only), fetches live prices from
PancakeSwap and BiSwap every 3 seconds, then feeds the last 20
price readings to GPT-4o-mini for confidence scoring.

If confidence >= 80% → prints 🔥 WOULD EXECUTE
Otherwise           → prints ⏳ skip
"""

import time
import json
import datetime
from web3 import Web3

from config import (
    BSC_RPC,
    PANCAKE_ROUTER, BISWAP_ROUTER,
    WBNB, BUSD,
    ROUTER_ABI,
    POLL_INTERVAL_SEC, BORROW_AMOUNT_WEI,
    OPENAI_API_KEY, AI_BASE_URL, AI_MODEL, CONFIDENCE_THRESHOLD,
)

# ── Web3 connection ────────────────────────────────────────
w3 = Web3(Web3.HTTPProvider(BSC_RPC))

# ── OpenAI setup ──────────────────────────────────────────
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
    print("  ⚠️  No OpenAI API key set. AI gating disabled (mock mode).")


def check_connection():
    """Verify Web3 connection is alive."""
    connected = w3.is_connected()
    block = w3.eth.block_number if connected else "N/A"
    print(f"  Connected : {connected}")
    print(f"  Block     : {block}")
    print(f"  Chain ID  : {w3.eth.chain_id if connected else 'N/A'}")
    return connected


def get_router(address):
    """Return a router contract instance."""
    return w3.eth.contract(
        address=Web3.to_checksum_address(address),
        abi=ROUTER_ABI,
    )


def fetch_price(router, token_in, token_out, amount_in):
    """
    Call getAmountsOut on a DEX router.
    Returns the output amount as a float (18 decimals).
    """
    path = [
        Web3.to_checksum_address(token_in),
        Web3.to_checksum_address(token_out),
    ]
    try:
        amounts = router.functions.getAmountsOut(amount_in, path).call()
        return float(amounts[-1]) / 1e18
    except Exception as e:
        return None, str(e)


def ask_ai(price_history):
    """
    Feed the last N price readings to GPT-4o-mini.
    Returns (confidence: float 0-1, reasoning: str).
    """
    if not ai_enabled:
        # Mock mode — simulate based on latest gap
        if not price_history:
            return 0.0, "No data yet"
        latest = price_history[-1]
        mock_conf = min(latest["gap_pct"] * 15, 0.95)  # scale gap to confidence
        reason = f"Mock: gap={latest['gap_pct']:.4f}%, scaled confidence"
        return mock_conf, reason

    # Build the prompt with price data
    data_str = json.dumps(price_history[-20:], indent=2)

    prompt = f"""You are an AI arbitrage evaluator for a DeFi flash-swap bot on BNB Chain.

Analyze these recent price readings from PancakeSwap and BiSwap for the BUSD→WBNB pair.
Each entry has: timestamp, pancakeswap_price, biswap_price, gap_pct (percentage difference).

Data (last {len(price_history[-20:])} ticks, 3s interval):
{data_str}

Evaluate:
1. Is the gap consistent or widening? (better for arbitrage)
2. Is the gap > 0.1%? (minimum for profit after 0.25% flash fee)
3. Is there enough momentum to sustain the gap during execution?

Respond in EXACTLY this JSON format (no markdown, no extra text):
{{"confidence": 0.XX, "reasoning": "one sentence explanation", "action": "execute" or "skip"}}

confidence must be a float between 0.00 and 1.00.
"""

    try:
        response = client.chat.completions.create(
            model=AI_MODEL,
            messages=[
                {"role": "system", "content": "You are a quantitative DeFi analyst. Always respond with valid JSON only."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=150,
        )

        raw = response.choices[0].message.content.strip()
        # Parse JSON from response
        result = json.loads(raw)
        confidence = float(result.get("confidence", 0))
        reasoning = result.get("reasoning", "No reasoning provided")
        return confidence, reasoning

    except json.JSONDecodeError:
        return 0.0, f"AI returned invalid JSON: {raw[:80]}"
    except Exception as e:
        return 0.0, f"AI error: {str(e)[:80]}"


def main():
    print("=" * 60)
    print("  ⚡ FlashGap AI — Watcher + AI Gating (Step 4)")
    print("=" * 60)
    print(f"  RPC       : {BSC_RPC}")
    print(f"  Pair      : BUSD → WBNB")
    print(f"  Amount    : {BORROW_AMOUNT_WEI / 1e18} BUSD")
    print(f"  Interval  : {POLL_INTERVAL_SEC}s")
    print(f"  AI Model  : {AI_MODEL}")
    print(f"  AI Enabled: {ai_enabled}")
    print(f"  Threshold : {CONFIDENCE_THRESHOLD * 100}%")
    print()

    # ── Check connection ───────────────────────────────
    if not check_connection():
        print("\n❌ Cannot connect to BSC RPC.")
        return

    print()

    # ── Setup routers ──────────────────────────────────
    pancake = get_router(PANCAKE_ROUTER)
    biswap = get_router(BISWAP_ROUTER)

    # ── Test single fetch ──────────────────────────────
    print("── Testing getAmountsOut ──")
    test_price = fetch_price(pancake, BUSD, WBNB, BORROW_AMOUNT_WEI)
    if isinstance(test_price, tuple):
        print(f"  ❌ PancakeSwap failed: {test_price[1]}")
        return
    print(f"  ✅ PancakeSwap: 1 BUSD = {test_price:.8f} WBNB")

    test_price_bi = fetch_price(biswap, BUSD, WBNB, BORROW_AMOUNT_WEI)
    biswap_ok = not isinstance(test_price_bi, tuple)
    if biswap_ok:
        print(f"  ✅ BiSwap:      1 BUSD = {test_price_bi:.8f} WBNB")
    else:
        print(f"  ⚠️  BiSwap failed — continuing with PancakeSwap only")

    print()
    print("=" * 60)
    print("  🔄 Live Price + AI Gating (Ctrl+C to stop)")
    print("=" * 60)
    print()

    # ── State ──────────────────────────────────────────
    price_history = []
    tick_count = 0
    ai_call_interval = 5  # call AI every N ticks (avoid rate limits)

    while True:
        try:
            now = datetime.datetime.now().strftime("%H:%M:%S")

            # Fetch prices
            price_pcs = fetch_price(pancake, BUSD, WBNB, BORROW_AMOUNT_WEI)
            if isinstance(price_pcs, tuple):
                print(f"  {now}  ⚠️ PancakeSwap error")
                time.sleep(POLL_INTERVAL_SEC)
                continue

            if biswap_ok:
                price_bi = fetch_price(biswap, BUSD, WBNB, BORROW_AMOUNT_WEI)
                if isinstance(price_bi, tuple):
                    price_bi = price_pcs
            else:
                price_bi = price_pcs

            # Calculate gap
            gap = abs(price_pcs - price_bi) / max(price_pcs, price_bi, 1e-18) * 100

            # Store in history
            tick_data = {
                "time": now,
                "pancakeswap": round(price_pcs, 10),
                "biswap": round(price_bi, 10),
                "gap_pct": round(gap, 6),
            }
            price_history.append(tick_data)
            if len(price_history) > 100:
                price_history = price_history[-50:]

            tick_count += 1

            # ── AI Evaluation ──────────────────────────
            if tick_count % ai_call_interval == 0 and len(price_history) >= 3:
                confidence, reasoning = ask_ai(price_history)

                if confidence >= CONFIDENCE_THRESHOLD:
                    action_str = "🔥 WOULD EXECUTE"
                    action_color = "\033[93m"  # yellow
                else:
                    action_str = "⏳ skip"
                    action_color = "\033[90m"  # gray

                print(f"  {now}  PCS={price_pcs:.8f}  BI={price_bi:.8f}  Gap={gap:.4f}%")
                print(f"         🤖 AI: {confidence*100:.1f}% — {reasoning}")
                print(f"         → {action_str}")
                print()
            else:
                # Regular tick (no AI call)
                print(f"  {now}  PCS={price_pcs:.8f}  BI={price_bi:.8f}  Gap={gap:.4f}%")

            time.sleep(POLL_INTERVAL_SEC)

        except KeyboardInterrupt:
            print(f"\n\n🛑 Stopped after {tick_count} ticks.")
            print(f"   {len(price_history)} price readings collected.")
            break
        except Exception as e:
            print(f"  ⚠️  Error: {e}")
            time.sleep(POLL_INTERVAL_SEC)
            continue


if __name__ == "__main__":
    main()
