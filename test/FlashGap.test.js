const { expect } = require("chai");
const { ethers } = require("hardhat");

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

    describe("Deployment", function () {
        it("should set the correct owner", async function () {
            expect(await flashGap.owner()).to.equal(owner.address);
        });

        it("should set factoryA correctly", async function () {
            expect(await flashGap.factoryA()).to.equal(FAKE_FACTORY);
        });

        it("should set minProfitBps correctly", async function () {
            expect(await flashGap.minProfitBps()).to.equal(MIN_PROFIT_BPS);
        });

        it("should initialise trade stats to zero", async function () {
            expect(await flashGap.totalTrades()).to.equal(0);
            expect(await flashGap.totalProfit()).to.equal(0);
        });
    });

    describe("Admin functions", function () {
        it("should allow owner to update minProfitBps", async function () {
            await expect(flashGap.setMinProfitBps(50))
                .to.emit(flashGap, "MinProfitUpdated")
                .withArgs(MIN_PROFIT_BPS, 50);

            expect(await flashGap.minProfitBps()).to.equal(50);
        });

        it("should reject non-owner from updating minProfitBps", async function () {
            await expect(
                flashGap.connect(addr1).setMinProfitBps(50)
            ).to.be.revertedWithCustomError(flashGap, "OwnableUnauthorizedAccount");
        });

        it("should reject non-owner from calling requestArbitrage", async function () {
            const tokenA = "0x0000000000000000000000000000000000000002";
            const tokenB = "0x0000000000000000000000000000000000000003";
            const routerA = "0x0000000000000000000000000000000000000004";
            const routerB = "0x0000000000000000000000000000000000000005";

            await expect(
                flashGap.connect(addr1).requestArbitrage(tokenA, tokenB, 1000, routerA, routerB)
            ).to.be.revertedWithCustomError(flashGap, "OwnableUnauthorizedAccount");
        });

        it("should reject requestArbitrage with zero amount", async function () {
            const tokenA = "0x0000000000000000000000000000000000000002";
            const tokenB = "0x0000000000000000000000000000000000000003";
            const routerA = "0x0000000000000000000000000000000000000004";
            const routerB = "0x0000000000000000000000000000000000000005";

            await expect(
                flashGap.requestArbitrage(tokenA, tokenB, 0, routerA, routerB)
            ).to.be.revertedWith("FlashGap: zero amount");
        });
    });

    describe("Receive BNB", function () {
        it("should accept BNB deposits", async function () {
            const tx = await owner.sendTransaction({
                to: await flashGap.getAddress(),
                value: ethers.parseEther("1.0"),
            });
            await tx.wait();
            const balance = await ethers.provider.getBalance(await flashGap.getAddress());
            expect(balance).to.equal(ethers.parseEther("1.0"));
        });

        it("should allow owner to withdraw BNB", async function () {
            // Send BNB to contract
            await owner.sendTransaction({
                to: await flashGap.getAddress(),
                value: ethers.parseEther("1.0"),
            });

            // Withdraw
            await flashGap.withdrawBNB();
            const balance = await ethers.provider.getBalance(await flashGap.getAddress());
            expect(balance).to.equal(0);
        });
    });
});
