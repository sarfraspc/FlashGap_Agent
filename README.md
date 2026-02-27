# ⚡ FlashGap AI

**Algorithmic Arbitrage with AI-Gated Execution on BNB Chain.**

FlashGap AI is a high-speed arbitrage bot that scans multiple liquidity pools across PancakeSwap and BiSwap. It leverages a LLaMA-3.3-70B Large Language Model (via Groq) to evaluate price gaps in real-time, only triggering on-chain transactions when confidence and profit margins exceed strict thresholds.

---

## 🚀 The Stack
- **Smart Contracts:** Solidity, OpenZeppelin (Flash Swap logic).
- **Core Engine:** Python, Web3.py.
- **AI Brain:** LLaMA-3.3-70B (Groq API) for sub-second trade gating.
- **Frontend:** React, Vite, Framer Motion, Wagmi/Viem.
- **Data Layers:** Hybrid (Mainnet Price feeds + Testnet Execution logs).

---

## 🔥 Key Features
- **Multi-Pair Scanner:** Scans BUSD, USDT, CAKE, ETH, XVS, and DOGE vs WBNB simultaneously.
- **AI-Gated Execution:** 90%+ confidence threshold prevents "toxic flow" and failed trades.
- **Flash-Swap Integration:** Zero-capital required (uses liquidity from one DEX to pay the other).
- **Real-Time Dashboard:** Glassmorphic UI showing live mainnet blocks and testnet contract state.
- **Execution Logging:** Structured JSON logs for every AI decision and on-chain TX.

---

## 🛠️ Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/sarfraspc/novum-risk-oracle
cd "FlashGap Web3"

# Install Backend
pip install web3 python-dotenv openai

# Install Frontend
cd frontend
npm install
```

### 2. Environment Setup
Create a `.env` in the root (use `.env.example` as a template):
```env
# API Keys
OPENAI_API_KEY=your_groq_api_key
AI_BASE_URL=https://api.groq.com/openai/v1

# Wallets
DEPLOYER_PRIVATE_KEY=your_testnet_private_key
FLASHGAP_CONTRACT_ADDRESS=0xa6acB349c32B59c20c898a025971f9e3080B6bf0
```

### 3. Run it
**Step A: The AI Agent (Backend)**
```bash
cd backend
python agent.py
```
**Step B: The Dashboard (Frontend)**
```bash
cd frontend
npm run dev
```

---

## 📜 Deployment Details
- **Network:** BNB Smart Chain Testnet
- **Contract:** `0xa6acB349c32B59c20c898a025971f9e3080B6bf0`
- **Audit:** Automated Chai-matchers test suite (22/22 Passing).

---

## 🛡️ Security & Compliance
- **Flash Loan Guard:** Only repayable loops are accepted by the smart contract.
- **Admin Gating:** Only the AI-authorized executor address can trigger `requestArbitrage`.
- **Slippage Protection:** Minimum profit BPS is strictly enforced on-chain.

*Built for BNB Chain x YZi Labs Hack Series · Bengaluru · 2026*
