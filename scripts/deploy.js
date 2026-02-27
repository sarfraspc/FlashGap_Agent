const hre = require("hardhat");

// ── PancakeSwap V2 Factory addresses ──────────────────
const FACTORIES = {
    bscMainnet: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",   // mainnet
    bscTestnet: "0x6725F303b657a9451d8BA641348b6761A6CC7a17",   // testnet
    bsctest: "0x6725F303b657a9451d8BA641348b6761A6CC7a17",   // alias
    hardhat: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",   // fork default
    localhost: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
};

async function main() {
    const network = hre.network.name;
    console.log("═".repeat(60));
    console.log("  ⚡ FlashGap AI — Deployment");
    console.log("═".repeat(60));
    console.log(`  Network : ${network} (chainId ${hre.network.config.chainId || "auto"})`);

    const [deployer] = await hre.ethers.getSigners();
    const balance = hre.ethers.formatEther(
        await hre.ethers.provider.getBalance(deployer.address)
    );
    console.log(`  Deployer: ${deployer.address}`);
    console.log(`  Balance : ${balance} BNB`);
    console.log("═".repeat(60));

    if (parseFloat(balance) < 0.01 && network !== "hardhat" && network !== "localhost") {
        console.error("\n❌ Deployer balance too low — need at least 0.01 tBNB for gas.");
        console.log("   Get testnet BNB: https://www.bnbchain.org/en/testnet-faucet");
        process.exit(1);
    }

    // ── Pick the right factory ──────────────────────────
    const PANCAKE_FACTORY =
        process.env.PANCAKESWAP_FACTORY || FACTORIES[network] || FACTORIES.bscTestnet;
    const MIN_PROFIT_BPS = 30; // 0.30 %

    console.log(`\n  Factory : ${PANCAKE_FACTORY}`);
    console.log(`  MinProfit: ${MIN_PROFIT_BPS} bps (${MIN_PROFIT_BPS / 100}%)`);

    // ── Deploy ──────────────────────────────────────────
    console.log("\n⏳ Deploying FlashGap...");
    const FlashGap = await hre.ethers.getContractFactory("FlashGap");
    const flashGap = await FlashGap.deploy(PANCAKE_FACTORY, MIN_PROFIT_BPS);
    await flashGap.waitForDeployment();

    const contractAddress = await flashGap.getAddress();

    console.log("\n" + "═".repeat(60));
    console.log(`  ✅ FlashGap deployed to: ${contractAddress}`);
    console.log("═".repeat(60));

    // ── Save address for later scripts ──────────────────
    const fs = require("fs");
    const deployData = {
        network,
        contractAddress,
        factoryA: PANCAKE_FACTORY,
        minProfitBps: MIN_PROFIT_BPS,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
    };
    fs.writeFileSync(
        "deployment.json",
        JSON.stringify(deployData, null, 2)
    );
    console.log("  📄 Saved to deployment.json\n");

    // ── Post-deploy: setMinProfitBps to emit an event (TX 2) ──
    if (network !== "hardhat" && network !== "localhost") {
        console.log("⏳ Sending post-deploy config TX (setMinProfitBps)...");
        const tx = await flashGap.setMinProfitBps(MIN_PROFIT_BPS);
        const receipt = await tx.wait();
        console.log(`  ✅ TX 2 confirmed: ${receipt.hash}`);
        console.log(`     Block: ${receipt.blockNumber}  Gas: ${receipt.gasUsed.toString()}`);
        console.log(`     Event: MinProfitUpdated(${MIN_PROFIT_BPS}, ${MIN_PROFIT_BPS})\n`);
    }

    // ── Verify on BscScan ───────────────────────────────
    if (network !== "hardhat" && network !== "localhost") {
        console.log("⏳ Waiting 5 confirmations for verification...");
        await flashGap.deploymentTransaction().wait(5);
        try {
            await hre.run("verify:verify", {
                address: contractAddress,
                constructorArguments: [PANCAKE_FACTORY, MIN_PROFIT_BPS],
            });
            console.log("✅ Contract verified on BscScan!");
        } catch (err) {
            console.log("⚠️  Verification skipped:", err.message);
        }
    }

    // ── Summary ─────────────────────────────────────────
    console.log("\n" + "═".repeat(60));
    console.log("  🎉 DEPLOYMENT COMPLETE");
    console.log("═".repeat(60));
    console.log(`  Contract : ${contractAddress}`);
    console.log(`  Explorer : https://testnet.bscscan.com/address/${contractAddress}`);
    console.log(`\n  Next steps:`);
    console.log(`  1. Fund contract with tBNB: send 0.01 BNB to ${contractAddress}`);
    console.log(`  2. Run interaction: npx hardhat run scripts/interact.js --network ${network}`);
    console.log("═".repeat(60));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
