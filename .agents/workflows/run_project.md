---
description: How to set up environment and run FlashGap project
---

## Prerequisites
- Node.js (v18+)
- npm
- Git
- Access to BSC testnet/mainnet RPC endpoints
- OpenAI API key (if using AI features)

## Steps
1. **Create a proper `.env` file**
   ```bash
   cp .env.example .env
   ```
   Edit the newly created `.env` and fill in the required values:
   - `DEPLOYER_PRIVATE_KEY` – your wallet private key (64‑hex characters, prefixed with `0x`).
   - `BSC_TESTNET_RPC` / `BSC_MAINNET_RPC` – RPC URLs for Binance Smart Chain.
   - `BSCSCAN_API_KEY` – optional, for contract verification.
   - `OPENAI_API_KEY` – your OpenAI secret key.
   - `GREENFIELD_RPC` and `GREENFIELD_BUCKET` – IPFS/Greenfield configuration.
   Save the file.

2. **Install project dependencies**
   ```bash
   npm install
   ```
   This installs both backend (Hardhat) and frontend packages.

3. **Compile smart contracts**
   ```bash
   npx hardhat compile
   ```

4. **Start a local Hardhat node (optional, for local testing)**
   ```bash
   npx hardhat node
   ```
   Keep this terminal open; it provides a local blockchain at `http://127.0.0.1:8545`.

5. **Deploy contracts**
   - **Testnet**
     ```bash
     npm run deploy:testnet
     ```
   - **Local** (if you started a Hardhat node)
     ```bash
     npm run deploy:local
     ```
   The deployment script reads values from `.env` and writes the deployed contract address back into the file.

6. **Run the frontend**
   ```bash
   cd frontend
   npm install   # (if not already done)
   npm run dev   # Vite dev server (or `npm start` if configured)
   ```
   Open `http://localhost:3000` in your browser.

7. **Verify everything works**
   - The UI should display the contract address from `.env`.
   - Interact with the dashboard; price feeds will be read via the configured DEX routers.
   - AI features will work if `OPENAI_API_KEY` is set.

## Optional: Production build
```bash
npm run build   # builds the frontend for production
```
Deploy the `dist` folder to your preferred static host.

---
*This workflow can be executed step‑by‑step, or you can run the whole script using a terminal multiplexer.*
