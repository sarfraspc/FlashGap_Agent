const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying FlashGap AI...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer:", deployer.address);
    console.log(
        "Balance:",
        hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)),
        "BNB\n"
    );

    // ── Config ─────────────────────────────────────────
    const PANCAKE_FACTORY =
        process.env.PANCAKESWAP_FACTORY || "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73";
    const MIN_PROFIT_BPS = 30; // 0.30 %

    // ── Deploy ─────────────────────────────────────────
    const FlashGap = await hre.ethers.getContractFactory("FlashGap");
    const flashGap = await FlashGap.deploy(PANCAKE_FACTORY, MIN_PROFIT_BPS);
    await flashGap.waitForDeployment();

    const address = await flashGap.getAddress();
    console.log("✅ FlashGap deployed to:", address);
    console.log("   Factory A:        ", PANCAKE_FACTORY);
    console.log("   Min Profit (bps): ", MIN_PROFIT_BPS);

    // ── Verify (optional) ──────────────────────────────
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        console.log("\n⏳ Waiting for block confirmations...");
        await flashGap.deploymentTransaction().wait(5);
        try {
            await hre.run("verify:verify", {
                address: address,
                constructorArguments: [PANCAKE_FACTORY, MIN_PROFIT_BPS],
            });
            console.log("✅ Contract verified on BscScan");
        } catch (err) {
            console.log("⚠️  Verification failed:", err.message);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
