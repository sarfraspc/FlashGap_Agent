# ⚡ FlashGap AI — Predictive Arbitrage Agent on BNB Chain

AI-powered flash-swap arbitrage system that detects price gaps between PancakeSwap and BiSwap, uses GPT-4o-mini for confidence scoring, and executes atomic on-chain trades when profitable.

**Built for**: BNB Chain x YZi Labs Hack Series — Bengaluru

---

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│  AI Watcher  │────▶│  FlashGap.sol │────▶│  PancakeSwap /   │
│  (Python)    │     │  (On-Chain)   │     │  BiSwap (DEXs)   │
└─────┬───────┘     └──────────────┘     └──────────────────┘
      │                                          │
      ▼                                          ▼
┌─────────────┐                          ┌──────────────────┐
│  GPT-4o-mini│                          │  Flash Swap       │
│  Confidence │                          │  Arb Execution    │
└─────────────┘                          └──────────────────┘
      │
      ▼
┌─────────────┐     ┌──────────────────┐
│  Greenfield  │     │  React Dashboard │
│  / IPFS Logs │     │  (Vite + Wagmi)  │
└─────────────┘     └──────────────────┘
```

---

## 📋 Prerequisites

Before starting, make sure you have these installed:

| Tool | Version | Check Command |
|------|---------|---------------|
| **Node.js** | ≥ 18.x | `node --version` |
| **npm** | ≥ 9.x | `npm --version` |
| **Python** | ≥ 3.10 | `python --version` |
| **Git** | any | `git --version` |
| **MetaMask** | browser extension | — |

---

## 🚀 Quick Start (3 steps)

### 1️⃣ Clone & Setup Environment

```bash
git clone https://github.com/sarfraspc/novum-risk-oracle.git
cd "FlashGap Web3"

# Copy the env template and fill in your keys
cp .env.example .env
```

**Edit `.env`** and fill in:
```env
DEPLOYER_PRIVATE_KEY=0xYOUR_64_CHAR_PRIVATE_KEY    # MetaMask → Account Details → Export Private Key
OPENAI_API_KEY=sk-your-openai-key                   # https://platform.openai.com/api-keys
```

### 2️⃣ Install Dependencies

```bash
# ── Root (Smart Contracts + Hardhat) ───────
npm install

# ── Frontend (React Dashboard) ────────────
cd frontend
npm install
cd ..

# ── Backend (Python AI Bot) ───────────────
cd backend
pip install -r requirements.txt
cd ..
```

### 3️⃣ Run Everything

```bash
# ── Compile & Test Smart Contracts ─────────
npx hardhat compile        # Should output: "Compiled 9 Solidity files"
npx hardhat test           # Should output: "22 passing"

# ── Start the Price Watcher Bot ────────────
cd backend
python agent.py            # Ctrl+C to stop
cd ..

# ── Start the Frontend Dashboard ───────────
cd frontend
npm run dev                # Opens at http://localhost:3000
```

---

## 🔗 Deployment (BSC Testnet)

> ⚠️ You need testnet BNB. Get some from: https://www.bnbchain.org/en/testnet-faucet

```bash
# Deploy contract to BSC Testnet
npx hardhat run scripts/deploy.js --network bsctest

# Run post-deploy interaction (generates on-chain TXs)
npx hardhat run scripts/interact.js --network bsctest
```

**Current deployment:**
- Contract: `0xa6acB349c32B59c20c898a025971f9e3080B6bf0`
- Explorer: https://testnet.bscscan.com/address/0xa6acB349c32B59c20c898a025971f9e3080B6bf0

---

## 📁 Project Structure

```
├── contracts/
│   ├── FlashGap.sol              # Core arbitrage contract
│   └── interfaces/               # DEX interfaces (Callee, Router, Pair, Factory)
├── scripts/
│   ├── deploy.js                 # Deploy + auto-verify on BscScan
│   └── interact.js               # Post-deploy admin TXs
├── test/
│   └── FlashGap.test.js          # 22 test cases
├── backend/
│   ├── agent.py                  # AI Watcher Bot (price feeds + AI gating)
│   ├── config.py                 # All settings loaded from .env
│   ├── greenfield.py             # IPFS / Greenfield log storage
│   └── requirements.txt          # Python dependencies
├── frontend/                     # React dashboard (Vite + Wagmi + Tailwind)
│   ├── src/
│   │   ├── App.jsx               # Main layout with Header + Footer
│   │   ├── main.jsx              # React entry (Wagmi + React Query)
│   │   ├── index.css             # Glassmorphism design system
│   │   ├── components/           # Dashboard cards
│   │   ├── hooks/                # Custom React hooks (prices, stats)
│   │   └── utils/                # Formatters
│   └── package.json
├── hardhat.config.js             # Solidity 0.8.20, BSC networks, optimizer
├── package.json                  # Root deps: Hardhat + OpenZeppelin
├── .env.example                  # Template (safe to commit)
└── .gitignore
```

---

## 🔑 Key Features

- **Flash Swap Arbitrage** — Zero-capital trades using PancakeSwap V2 flash swaps
- **AI Gating** — GPT-4o-mini evaluates price gaps before execution
- **On-Chain Safety** — ReentrancyGuard, Ownable, Pausable, slippage guard, min-profit check
- **Decentralized Logging** — Execution proofs uploaded to BNB Greenfield/IPFS
- **Live Dashboard** — Real-time price gaps, AI confidence, and execution history
- **Emergency Controls** — Pause circuit-breaker + token/BNB rescue functions

---

## 🛡️ Security

- `onlyOwner` — Only the deployer wallet can trigger trades
- `nonReentrant` — Prevents reentrancy attacks
- `whenNotPaused` — Emergency kill-switch
- Custom errors — Gas-efficient reverts with detailed error data
- Slippage guard — Per-call `minAmountOut` + global `maxSlippageBps`
- Min profit threshold — Won't execute unprofitable trades

---

## 📜 License

MIT
