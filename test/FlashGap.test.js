const { expect } = require("chai");
const { ethers } = require("hardhat");
require("@nomicfoundation/hardhat-chai-matchers");

describe("FlashGap", function () {
    let flashGap;
    let owner, addr1;
    const FAKE_FACTORY = "0x0000000000000000000000000000000000000001";
    const MIN_PROFIT_BPS = 30;

    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();
        const FlashGap = await ethers.getContractFactory("FlashGap");
        flashGap = await FlashGap.deploy(FAKE_FACTORY, MIN_PROFIT_BPS);
        await flashGap.waitForDeployment();
    });

    // DEPLOYMENT
    describe("Deployment", function () {
        it("should set the correct owner", async function () {
            expect(await flashGap.owner()).to.equal(owner.address);
        });

        it("should set factoryA correctly", async function () {
            expect(await flashGap.factoryA()).to.equal(FAKE_FACTORY);
        });

        it("should set minProfitBps correctly", async function () {
            expect(await flashGap.minProfitBps()).to.equal(BigInt(MIN_PROFIT_BPS));
        });

        it("should set default maxSlippageBps to 100 (1%)", async function () {
            expect(await flashGap.maxSlippageBps()).to.equal(100n);
        });

        it("should set default flashFeeNumerator to 25 (0.25%)", async function () {
            expect(await flashGap.flashFeeNumerator()).to.equal(25n);
        });

        it("should initialise trade stats to zero", async function () {
            expect(await flashGap.totalTrades()).to.equal(0n);
            expect(await flashGap.totalProfit()).to.equal(0n);
        });

        it("should revert deployment with zero-address factory", async function () {
            const FlashGap = await ethers.getContractFactory("FlashGap");
            await expect(
                FlashGap.deploy(ethers.ZeroAddress, MIN_PROFIT_BPS)
            ).to.be.reverted;
        });
    });

    // ADMIN FUNCTIONS
    describe("Admin functions", function () {
        it("should allow owner to update minProfitBps", async function () {
            const tx = await flashGap.setMinProfitBps(50);
            await tx.wait();
            expect(await flashGap.minProfitBps()).to.equal(50n);
        });

        it("should allow owner to update maxSlippageBps", async function () {
            const tx = await flashGap.setMaxSlippageBps(200);
            await tx.wait();
            expect(await flashGap.maxSlippageBps()).to.equal(200n);
        });

        it("should allow owner to update factory", async function () {
            const newFactory = "0x0000000000000000000000000000000000000099";
            const tx = await flashGap.setFactory(newFactory);
            await tx.wait();
            expect(await flashGap.factoryA()).to.equal(newFactory);
        });

        it("should revert setFactory with zero address", async function () {
            await expect(
                flashGap.setFactory(ethers.ZeroAddress)
            ).to.be.reverted;
        });

        it("should allow owner to update flashFeeNumerator", async function () {
            await flashGap.setFlashFeeNumerator(30);
            expect(await flashGap.flashFeeNumerator()).to.equal(30n);
        });

        it("should reject non-owner from updating minProfitBps", async function () {
            await expect(
                flashGap.connect(addr1).setMinProfitBps(50)
            ).to.be.reverted;
        });

        it("should reject non-owner from calling requestArbitrage", async function () {
            const tokenA = "0x0000000000000000000000000000000000000002";
            const tokenB = "0x0000000000000000000000000000000000000003";
            const routerA = "0x0000000000000000000000000000000000000004";
            const routerB = "0x0000000000000000000000000000000000000005";

            await expect(
                flashGap.connect(addr1).requestArbitrage(tokenA, tokenB, 1000, routerA, routerB, 0)
            ).to.be.reverted;
        });

        it("should reject requestArbitrage with zero amount", async function () {
            const tokenA = "0x0000000000000000000000000000000000000002";
            const tokenB = "0x0000000000000000000000000000000000000003";
            const routerA = "0x0000000000000000000000000000000000000004";
            const routerB = "0x0000000000000000000000000000000000000005";

            await expect(
                flashGap.requestArbitrage(tokenA, tokenB, 0, routerA, routerB, 0)
            ).to.be.reverted;
        });
    });

    // PAUSE / UNPAUSE
    describe("Pausable", function () {
        it("should allow owner to pause and unpause", async function () {
            await flashGap.pause();

            const tokenA = "0x0000000000000000000000000000000000000002";
            const tokenB = "0x0000000000000000000000000000000000000003";
            const routerA = "0x0000000000000000000000000000000000000004";
            const routerB = "0x0000000000000000000000000000000000000005";

            await expect(
                flashGap.requestArbitrage(tokenA, tokenB, 1000, routerA, routerB, 0)
            ).to.be.reverted;

            await flashGap.unpause();
            // after unpause it should proceed (will revert at factory call, not pause)
        });

        it("should reject non-owner from pausing", async function () {
            await expect(
                flashGap.connect(addr1).pause()
            ).to.be.reverted;
        });
    });

    // EMERGENCY WITHDRAW
    describe("Emergency withdraw", function () {
        it("should accept BNB deposits", async function () {
            const tx = await owner.sendTransaction({
                to: await flashGap.getAddress(),
                value: ethers.parseEther("1.0"),
            });
            await tx.wait();
            const balance = await ethers.provider.getBalance(await flashGap.getAddress());
            expect(balance).to.equal(ethers.parseEther("1.0"));
        });

        it("should allow owner to emergency withdraw BNB", async function () {
            await owner.sendTransaction({
                to: await flashGap.getAddress(),
                value: ethers.parseEther("1.0"),
            });

            await flashGap.emergencyWithdrawBNB();
            const balance = await ethers.provider.getBalance(await flashGap.getAddress());
            expect(balance).to.equal(0n);
        });

        it("should reject non-owner from emergency withdraw BNB", async function () {
            await expect(
                flashGap.connect(addr1).emergencyWithdrawBNB()
            ).to.be.reverted;
        });

        it("should reject emergencyWithdrawToken with zero address", async function () {
            await expect(
                flashGap.emergencyWithdrawToken(ethers.ZeroAddress, 100)
            ).to.be.reverted;
        });
    });

    // CONSTANTS
    describe("Constants", function () {
        it("FEE_DENOMINATOR should be 10000", async function () {
            expect(await flashGap.FEE_DENOMINATOR()).to.equal(10000n);
        });
    });
});
