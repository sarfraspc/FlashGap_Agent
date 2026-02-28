"""
FlashGap AI — Configuration & Constants
"""
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

# ── Blockchain — Mainnet (read-only price feeds) ──────────
BSC_RPC = os.getenv("BSC_MAINNET_RPC", "https://bsc-dataseed1.binance.org")

# ── Blockchain — Testnet (write TXs) ─────────────────────
BSC_TESTNET_RPC = os.getenv("BSC_TESTNET_RPC", "https://data-seed-prebsc-1-s1.binance.org:8545")

# ── DEX Routers (BSC Mainnet) ────────────────────────────
PANCAKE_ROUTER = os.getenv("PANCAKESWAP_ROUTER", "0x10ED43C718714eb63d5aA57B78B54704E256024E")
BISWAP_ROUTER  = os.getenv("BISWAP_ROUTER",      "0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8")

# ── Token Addresses (BSC Mainnet) ────────────────────────
WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"
USDT = "0x55d398326f99059fF775485246999027B3197955"
CAKE = "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82"
ETH  = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8"
XVS  = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63"
DOGE = "0xbA2aE424d960c26247Dd6c32edC70B295c744C43"

# ── Pairs to scan (token_in, token_out, label, decimals_in) ──
SCAN_PAIRS = [
    {"token_in": BUSD, "token_out": WBNB, "label": "BUSD/WBNB",  "decimals": 18},
    {"token_in": USDT, "token_out": WBNB, "label": "USDT/WBNB",  "decimals": 18},
    {"token_in": CAKE, "token_out": WBNB, "label": "CAKE/WBNB",  "decimals": 18},
    {"token_in": ETH,  "token_out": WBNB, "label": "ETH/WBNB",   "decimals": 18},
    {"token_in": WBNB, "token_out": XVS,  "label": "WBNB/XVS",   "decimals": 18},
    {"token_in": WBNB, "token_out": DOGE, "label": "WBNB/DOGE",  "decimals": 18},
]

# ── Testnet token addresses ──────────────────────────────
TESTNET_WBNB = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
TESTNET_BUSD = "0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee"
TESTNET_PANCAKE_ROUTER = "0xD99D1c33F9fC3444f8101754aBC46c52416550D1"
TESTNET_BISWAP_ROUTER = os.getenv("TESTNET_BISWAP_ROUTER", "0x53B0B94Cb9EEeb975dcfEA30d2dEe3E36b442bDF")

# ── Watcher settings ─────────────────────────────────────
POLL_INTERVAL_SEC = 3
BORROW_AMOUNT_WEI = 10 ** 18     # 1 token (e.g. 1 BUSD)

# ── Router ABI (minimal — getAmountsOut only) ────────────
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

# ── FlashGap Contract ABI (minimal — admin + arb calls) ──
FLASHGAP_ABI = [
    {
        "inputs": [
            {"internalType": "address", "name": "tokenBorrow", "type": "address"},
            {"internalType": "address", "name": "tokenTarget", "type": "address"},
            {"internalType": "uint256", "name": "amount", "type": "uint256"},
            {"internalType": "address", "name": "routerA", "type": "address"},
            {"internalType": "address", "name": "routerB", "type": "address"},
            {"internalType": "uint256", "name": "minAmountOut", "type": "uint256"},
        ],
        "name": "requestArbitrage",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [{"internalType": "uint256", "name": "_bps", "type": "uint256"}],
        "name": "setMinProfitBps",
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
    {
        "inputs": [],
        "name": "minProfitBps",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
]

# ── FlashGap Contract ────────────────────────────────────
FLASHGAP_CONTRACT = os.getenv("FLASHGAP_CONTRACT_ADDRESS", "")
DEPLOYER_PRIVATE_KEY = os.getenv("DEPLOYER_PRIVATE_KEY", "")

# ── AI / Groq (OpenAI-compatible) ────────────────────────
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
AI_BASE_URL = os.getenv("AI_BASE_URL", "https://api.groq.com/openai/v1")
AI_MODEL = os.getenv("AI_MODEL", "llama-3.3-70b-versatile")
CONFIDENCE_THRESHOLD = 0.80
MIN_PROFIT_USD = 0.50

# ── Greenfield / IPFS ────────────────────────────────────
GREENFIELD_RPC = os.getenv("GREENFIELD_RPC", "https://greenfield-chain.bnbchain.org")
GREENFIELD_BUCKET = os.getenv("GREENFIELD_BUCKET", "flashgap-logs")
