"""
FlashGap AI — Minimal Price Watcher (Step 3)

Connects to BSC mainnet (read-only) and fetches live prices
from PancakeSwap and BiSwap every 3 seconds.

No AI. No execution. Just price monitoring.
"""

import time
import datetime
from web3 import Web3

from config import (
    BSC_RPC,
    PANCAKE_ROUTER, BISWAP_ROUTER,
    WBNB, BUSD,
    ROUTER_ABI,
    POLL_INTERVAL_SEC, BORROW_AMOUNT_WEI,
)

# ── Web3 connection ────────────────────────────────────────
w3 = Web3(Web3.HTTPProvider(BSC_RPC))


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
    Returns the output amount as a float (in token_out units, 18 decimals).
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


def main():
    print("=" * 60)
    print("  ⚡ FlashGap AI — Price Watcher (Step 3)")
    print("=" * 60)
    print(f"  RPC      : {BSC_RPC}")
    print(f"  Pair     : BUSD → WBNB")
    print(f"  Amount   : {BORROW_AMOUNT_WEI / 1e18} BUSD")
    print(f"  Interval : {POLL_INTERVAL_SEC}s")
    print()

    # ── Check connection ───────────────────────────────
    if not check_connection():
        print("\n❌ Cannot connect to BSC RPC. Check your internet / RPC URL.")
        return

    print()

    # ── Setup routers ──────────────────────────────────
    pancake = get_router(PANCAKE_ROUTER)
    biswap  = get_router(BISWAP_ROUTER)

    print("  PancakeSwap Router :", PANCAKE_ROUTER)
    print("  BiSwap Router      :", BISWAP_ROUTER)
    print()

    # ── Test single fetch ──────────────────────────────
    print("── Testing getAmountsOut (single call) ──")
    test_price = fetch_price(pancake, BUSD, WBNB, BORROW_AMOUNT_WEI)
    if isinstance(test_price, tuple):
        print(f"  ❌ PancakeSwap call failed: {test_price[1]}")
        return
    print(f"  ✅ PancakeSwap: 1 BUSD = {test_price:.8f} WBNB")

    test_price_bi = fetch_price(biswap, BUSD, WBNB, BORROW_AMOUNT_WEI)
    if isinstance(test_price_bi, tuple):
        print(f"  ⚠️  BiSwap call failed: {test_price_bi[1]}")
        print("     (BiSwap may be down — continuing with PancakeSwap only)\n")
        biswap_ok = False
    else:
        print(f"  ✅ BiSwap:      1 BUSD = {test_price_bi:.8f} WBNB")
        biswap_ok = True

    print()
    print("=" * 60)
    print("  🔄 Starting live price loop (Ctrl+C to stop)")
    print("=" * 60)
    print(f"  {'Time':<12} {'PancakeSwap':<18} {'BiSwap':<18} {'Gap %':<10}")
    print("  " + "─" * 56)

    # ── Poll loop ──────────────────────────────────────
    tick_count = 0
    while True:
        try:
            now = datetime.datetime.now().strftime("%H:%M:%S")

            price_pcs = fetch_price(pancake, BUSD, WBNB, BORROW_AMOUNT_WEI)
            pcs_str = f"{price_pcs:.8f}" if not isinstance(price_pcs, tuple) else "ERROR"

            if biswap_ok:
                price_bi = fetch_price(biswap, BUSD, WBNB, BORROW_AMOUNT_WEI)
                bi_str = f"{price_bi:.8f}" if not isinstance(price_bi, tuple) else "ERROR"
            else:
                price_bi = price_pcs  # mirror for display
                bi_str = "N/A"

            # Calculate gap
            if not isinstance(price_pcs, tuple) and not isinstance(price_bi, tuple) and biswap_ok:
                gap = abs(price_pcs - price_bi) / max(price_pcs, price_bi, 1e-18) * 100
                gap_str = f"{gap:.4f}%"
            else:
                gap_str = "—"

            print(f"  {now:<12} {pcs_str:<18} {bi_str:<18} {gap_str:<10}")

            tick_count += 1
            if tick_count == 1:
                print("  " + "─" * 56)
                print("  ✅ getAmountsOut working! Prices streaming live.")
                print("  " + "─" * 56)

        except KeyboardInterrupt:
            print(f"\n\n🛑 Stopped after {tick_count} ticks.")
            break
        except Exception as e:
            print(f"  ⚠️  Error: {e}")

        time.sleep(POLL_INTERVAL_SEC)


if __name__ == "__main__":
    main()
