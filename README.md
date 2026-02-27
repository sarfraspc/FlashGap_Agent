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

## 📁 Project Structure

```
├── contracts/
│   ├── FlashGap.sol              # Core arbitrage contract
│   └── interfaces/               # DEX interfaces
│       ├── IUniswapV2Callee.sol
│       ├── IUniswapV2Router02.sol
│       ├── IUniswapV2Pair.sol
│       └── IUniswapV2Factory.sol
├── scripts/
│   └── deploy.js                 # Hardhat deployment script
├── test/
│   └── FlashGap.test.js          # Contract tests
├── backend/
│   ├── agent.py                  # AI Watcher Bot
│   ├── greenfield.py             # Greenfield/IPFS logging
│   ├── config.py                 # Configuration & constants
│   └── requirements.txt          # Python dependencies
├── frontend/                     # React dashboard (Vite + Wagmi)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── PriceGapCard.jsx
│   │   │   ├── AIConfidenceCard.jsx
│   │   │   ├── ExecutionLog.jsx
│   │   │   └── ProfitSummary.jsx
│   │   └── config/
│   │       └── wagmi.js
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── hardhat.config.js
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### Smart Contracts
```bash
npm install
npx hardhat compile
npx hardhat test
```

### Backend (AI Bot)
```bash
cd backend
pip install -r requirements.txt
cp ../.env.example ../.env   # fill in your keys
python agent.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔑 Key Features

- **Flash Swap Arbitrage** — Zero-capital trades using PancakeSwap V2 flash swaps
- **AI Gating** — GPT-4o-mini evaluates price gaps before execution
- **On-Chain Safety** — ReentrancyGuard, Ownable, minimum profit threshold
- **Decentralized Logging** — Execution proofs uploaded to BNB Greenfield/IPFS
- **Live Dashboard** — Real-time price gaps, AI confidence, and execution history

## 📜 License

MIT
