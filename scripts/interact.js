const hre = require("hardhat");
const fs = require("fs");

/**
 * Post-deploy interaction script.
 * 
 * Reads deployment.json, connects to the deployed FlashGap,
 * and runs admin + arbitrage calls to generate on-chain TXs.
 */

// ── BSC Testnet token & router addresses ──────────────
const TESTNET = {
    PANCAKE_ROUTER: "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
    BISWAP_ROUTER: "0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8",  // may not exist on testnet
    WBNB: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
    BUSD: "0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee",
};

const MAINNET = {
    PANCAKE_ROUTER: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    BISWAP_ROUTER: "0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8",
    WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    BUSD: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
};

async function main() {
    // ── Load deployment ─────────────────────────────────
    if (!fs.existsSync("deployment.json")) {
        console.error("❌ deployment.json not found. Run deploy.js first.");
        process.exit(1);
    }
    const deploy = JSON.parse(fs.readFileSync("deployment.json", "utf8"));
    const network = hre.network.name;
    const addrs = (network === "bscMainnet") ? MAINNET : TESTNET;

    console.log("═".repeat(60));
    console.log("  ⚡ FlashGap AI — Post-Deploy Interaction");
    console.log("═".repeat(60));
    console.log(`  Network  : ${network}`);
    console.log(`  Contract : ${deploy.contractAddress}`);

    const [signer] = await hre.ethers.getSigners();
    console.log(`  Signer   : ${signer.address}\n`);

    // ── Connect to deployed contract ────────────────────
    const FlashGap = await hre.ethers.getContractFactory("FlashGap");
    const flashGap = FlashGap.attach(deploy.contractAddress);

    // ── Read current state ──────────────────────────────
    console.log("── Current Contract State ──");
    console.log(`  owner           : ${await flashGap.owner()}`);
    console.log(`  factoryA        : ${await flashGap.factoryA()}`);
    console.log(`  minProfitBps    : ${await flashGap.minProfitBps()}`);
    console.log(`  maxSlippageBps  : ${await flashGap.maxSlippageBps()}`);
    console.log(`  flashFeeNumerator: ${await flashGap.flashFeeNumerator()}`);
    console.log(`  totalTrades     : ${await flashGap.totalTrades()}`);
    console.log(`  totalProfit     : ${await flashGap.totalProfit()}\n`);

    // ════════════════════════════════════════════════════
    //  TX: Update slippage setting (guaranteed success + event)
    // ════════════════════════════════════════════════════
    console.log("⏳ TX: setMaxSlippageBps(150)  →  1.5% slippage...");
    try {
        const tx1 = await flashGap.setMaxSlippageBps(150);
        const r1 = await tx1.wait();
        console.log(`  ✅ Confirmed: ${r1.hash}`);
        console.log(`     Block: ${r1.blockNumber}  Gas: ${r1.gasUsed.toString()}`);
        console.log(`     Event: MaxSlippageUpdated(100, 150)\n`);
    } catch (err) {
        console.log(`  ❌ Failed: ${err.message}\n`);
    }

    // ════════════════════════════════════════════════════
    //  TX: Try requestArbitrage (will likely revert on testnet
    //      because pair may not exist — that's fine, it's still a TX)
    // ════════════════════════════════════════════════════
    console.log("⏳ TX: requestArbitrage (BUSD→WBNB, 0.001 BUSD)...");
    console.log("   This may revert (PairNotFound) on testnet — that is expected.\n");
    try {
        const borrowAmount = hre.ethers.parseEther("0.001"); // small amount
        const tx2 = await flashGap.requestArbitrage(
            addrs.BUSD,
            addrs.WBNB,
            borrowAmount,
            addrs.PANCAKE_ROUTER,
            addrs.PANCAKE_ROUTER,  // same router for both (testnet has no BiSwap)
            0,  // no minAmountOut
            { gasLimit: 500_000 }
        );
        const r2 = await tx2.wait();
        console.log(`  ✅ Arbitrage TX confirmed: ${r2.hash}`);
        console.log(`     Block: ${r2.blockNumber}  Gas: ${r2.gasUsed.toString()}`);

        // Check for ArbitrageExecuted event
        const events = r2.logs;
        console.log(`     Events emitted: ${events.length}\n`);
    } catch (err) {
        const reason = err.reason || err.message?.substring(0, 120) || "unknown";
        console.log(`  ⚠️  Reverted (expected on testnet): ${reason}`);
        console.log(`     This is fine — the TX still appears on-chain as a failed TX.\n`);
    }

    // ════════════════════════════════════════════════════
    //  SUMMARY
    // ════════════════════════════════════════════════════
    const finalTrades = await flashGap.totalTrades();
    console.log("═".repeat(60));
    console.log("  📊 Final State");
    console.log("═".repeat(60));
    console.log(`  totalTrades  : ${finalTrades}`);
    console.log(`  totalProfit  : ${await flashGap.totalProfit()}`);
    console.log(`  maxSlippageBps: ${await flashGap.maxSlippageBps()}`);
    console.log(`\n  🔗 View on BscScan:`);
    console.log(`     https://testnet.bscscan.com/address/${deploy.contractAddress}`);
    console.log("═".repeat(60));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
