require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const DEPLOYER_PRIVATE_KEY =
    process.env.DEPLOYER_PRIVATE_KEY ||
    "0x0000000000000000000000000000000000000000000000000000000000000001";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: { enabled: true, runs: 200 },
        },
    },
    networks: {
        hardhat: {
            forking: {
                url: process.env.BSC_MAINNET_RPC || "https://bsc-dataseed1.binance.org",
                enabled: false, // enable when you want to fork mainnet locally
            },
        },
        bscTestnet: {
            url: process.env.BSC_TESTNET_RPC || "https://data-seed-prebsc-1-s1.binance.org:8545",
            chainId: 97,
            accounts: [DEPLOYER_PRIVATE_KEY],
        },
        bscMainnet: {
            url: process.env.BSC_MAINNET_RPC || "https://bsc-dataseed1.binance.org",
            chainId: 56,
            accounts: [DEPLOYER_PRIVATE_KEY],
        },
    },
    etherscan: {
        apiKey: process.env.BSCSCAN_API_KEY || "",
    },
};
