"""
FlashGap AI — Configuration & Constants
"""
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

# ── Blockchain (mainnet RPC for price reads — free, no gas) ─
BSC_RPC = os.getenv("BSC_MAINNET_RPC", "https://bsc-dataseed1.binance.org")

# ── DEX Routers (BSC Mainnet) ──────────────────────────────
PANCAKE_ROUTER = os.getenv("PANCAKESWAP_ROUTER", "0x10ED43C718714eb63d5aA57B78B54704E256024E")
BISWAP_ROUTER  = os.getenv("BISWAP_ROUTER",      "0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8")

# ── Token Addresses (BSC Mainnet) ──────────────────────────
WBNB = os.getenv("WBNB", "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c")
BUSD = os.getenv("BUSD", "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56")
USDT = os.getenv("USDT", "0x55d398326f99059fF775485246999027B3197955")

# ── Watcher settings ──────────────────────────────────────
POLL_INTERVAL_SEC = 3
BORROW_AMOUNT_WEI = 10 ** 18     # 1 token (e.g. 1 BUSD)

# ── Router ABI (minimal — getAmountsOut only) ─────────────
ROUTER_ABI = [
    {
        "inputs": [
            {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
            {"internalType": "address[]", "name": "path", "type": "address[]"},
        ],
        "name": "getAmountsOut",
        "outputs": [
            {"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}
        ],
        "stateMutability": "view",
        "type": "function",
    }
]
