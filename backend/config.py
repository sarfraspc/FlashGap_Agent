"""
FlashGap AI — Configuration & Constants
"""
import os
from dotenv import load_dotenv

load_dotenv()

# ── Blockchain ──────────────────────────────────────────
BSC_RPC = os.getenv("BSC_TESTNET_RPC", "https://data-seed-prebsc-1-s1.binance.org:8545")
DEPLOYER_PRIVATE_KEY = os.getenv("DEPLOYER_PRIVATE_KEY", "")
FLASHGAP_CONTRACT = os.getenv("FLASHGAP_CONTRACT_ADDRESS", "")

# ── DEX Routers ─────────────────────────────────────────
PANCAKE_ROUTER = os.getenv("PANCAKESWAP_ROUTER", "0x10ED43C718714eb63d5aA57B78B54704E256024E")
BISWAP_ROUTER = os.getenv("BISWAP_ROUTER", "0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8")

# ── Token Addresses ─────────────────────────────────────
WBNB = os.getenv("WBNB", "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c")
BUSD = os.getenv("BUSD", "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56")
USDT = os.getenv("USDT", "0x55d398326f99059fF775485246999027B3197955")

# ── AI ──────────────────────────────────────────────────
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
AI_MODEL = "gpt-4o-mini"
CONFIDENCE_THRESHOLD = 0.80      # 80 %
MIN_PROFIT_USD = 0.50            # $0.50

# ── Watcher ─────────────────────────────────────────────
POLL_INTERVAL_SEC = 3
PRICE_HISTORY_LEN = 20           # how many data-points to feed AI
BORROW_AMOUNT_WEI = 10 ** 18     # 1 token unit

# ── Greenfield / IPFS ──────────────────────────────────
GREENFIELD_RPC = os.getenv("GREENFIELD_RPC", "https://greenfield-chain.bnbchain.org")
GREENFIELD_BUCKET = os.getenv("GREENFIELD_BUCKET", "flashgap-logs")

# ── Router ABI (minimal — getAmountsOut) ────────────────
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

# ── FlashGap Contract ABI (minimal) ────────────────────
FLASHGAP_ABI = [
    {
        "inputs": [
            {"internalType": "address", "name": "tokenBorrow", "type": "address"},
            {"internalType": "address", "name": "tokenTarget", "type": "address"},
            {"internalType": "uint256", "name": "amount", "type": "uint256"},
            {"internalType": "address", "name": "routerA", "type": "address"},
            {"internalType": "address", "name": "routerB", "type": "address"},
        ],
        "name": "requestArbitrage",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "totalTrades",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "totalProfit",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
]
