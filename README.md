# FlashGap AI

**Algorithmic Arbitrage with AI-Gated Execution on BNB Chain**

FlashGap AI is a high-speed quantitative arbitrage bot designed to scan multiple liquidity pools across decentralized exchanges (PancakeSwap and BiSwap) on the BNB Chain. By integrating an on-chain flash swap contract with an off-chain AI decision engine (LLaMA-3.3-70B via Groq), the system evaluates real-time price divergences and executes trades only when profit margins and AI confidence exceed strict thresholds.

## Architecture & Technology Stack

- **Smart Contracts (Solidity):** Flash swap logic leveraging OpenZeppelin, designed to borrow, swap, and repay within a single atomic transaction.
- **Core Engine (Python):** Utilizing Web3.py to concurrently scan multiple pairs (WBNB against BUSD, USDT, CAKE, ETH, XVS, DOGE).
- **AI Engine:** LLaMA-3.3-70B (via Groq API) acts as a sub-second macro-filter, preventing execution on volatile, low-probability, or "toxic" flow based on historical transaction (RAG) context.
- **Frontend Dashboard:** React, Vite, Framer Motion, and Wagmi/Viem provide a real-time, glassmorphic command center to track executions, AI confidence, and cumulative opportunity value.
- **Data Layers:** Hybrid architecture reading live pricing data from BNB Mainnet while executing safe test transactions on the BNB Testnet.

## Key Features

- **Multi-Pair Concurrent Scanner:** Tracks 6 different token pairs simultaneously across two prominent DEXs.
- **AI-Gated Execution:** Transactions are only pushed to the mempool if the AI model calculates a high probability of success (e.g., >80% confidence) based on current gap sizes and historical trade context.
- **Atomic Flash-Swaps:** Zero-capital requirement. The system uses flash loans to borrow liquidity, execute the arbitrage, and repay the loan in one transaction. If the trade is unprofitable, it reverts with minimal gas loss.
- **Real-Time Visualization:** A dynamic React dashboard that consumes state directly from the Python agent, displaying execution logs, profit metrics, and the AI's real-time reasoning.
- **Persistent State & Logging:** Structured JSON logs capture every AI decision matrix and on-chain transaction receipt for continuous learning and auditing.

## Prerequisites

- **Node.js:** v18 or newer
- **Python:** 3.10 or newer
- **RPC Endpoints:** BSC Mainnet and BSC Testnet (default Binance public endpoints are configured, but private RPCs are recommended for high-frequency scanning).
- **Groq API Key:** For LLaMA model access.

## Quick Start Guide

### 1. Clone the Repository

```bash
git clone https://github.com/sarfraspc/novum-risk-oracle.git
cd "FlashGap Web3"
```

### 2. Environment Configuration

Create a `.env` file in the root directory. You can use `.env.example` as a reference.

```env
# Blockchain
DEPLOYER_PRIVATE_KEY=your_bsc_testnet_private_key
BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.binance.org:8545
BSC_MAINNET_RPC=https://bsc-dataseed1.binance.org

# Smart Contract
FLASHGAP_CONTRACT_ADDRESS=0xa6acB349c32B59c20c898a025971f9e3080B6bf0

# AI Configuration
OPENAI_API_KEY=your_groq_api_key
```

### 3. Install Dependencies

**Backend (Python):**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
# Alternatively, install manually: pip install web3 python-dotenv openai requests
```

**Frontend (React/Node):**
```bash
cd frontend
npm install
cd ..
```

### 4. Running the System

To run the complete system, you need to start both the Python backend agent and the React frontend dashboard simultaneously.

**Start the Backend Agent:**
```bash
# In the root directory (ensure virtual environment is activated)
cd backend
python agent.py
```

**Start the Frontend Dashboard:**
```bash
# In a new terminal window
cd frontend
npm run dev
```

Navigate to `http://localhost:3000` in your web browser to view the real-time execution dashboard.

## Smart Contract Security Mechanisms

The `FlashGap.sol` contract implements several strict safety mechanisms:
- **Flash Loan Guard:** The transaction will explicitly revert if the final balance after the arbitrage loop is insufficient to repay the initial flash loan plus fees.
- **Access Control:** The `requestArbitrage` function is strictly governed by an `onlyOwner` modifier, ensuring that only the authorized off-chain Python agent can trigger executions.
- **Slippage Enforcement:** Administrators can set a dynamic `minProfitBps` and `maxSlippageBps` directly on the contract to enforce minimum profitability at the EVM level.

## Future Roadmap

- **Mainnet Deployment:** Transitioning the execution layer from BNB Testnet to BNB Mainnet.
- **Expanded DEX Integration:** Adding support for additional liquidity protocols like Uniswap V3 (tick-based liquidity) on BNB Chain.
- **Advanced RAG Capabilities:** Integrating a vector database (e.g., Qdrant) to store months of historical tick data, allowing the AI to query complex market patterns before executing.
- **Execution Optimization:** Migrating the Python scanning loop to Rust or Go for microsecond latency improvements.

## Hackathon Context

This project was initially conceived and built for the **BNB Chain x YZi Labs Hack Series (Bengaluru, 2026)**. Focus areas include De-Fi infrastructure, AI-agent integration, and high-frequency smart contract interaction on the BNB Chain.

## License

MIT License
