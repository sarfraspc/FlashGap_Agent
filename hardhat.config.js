require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Fallback is a valid 32-byte dummy — only used for compilation, never for real TXs
const RAW_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";
const DEPLOYER_PRIVATE_KEY = RAW_KEY.startsWith("0x") && RAW_KEY.length === 66
    ? RAW_KEY
    : "0x0000000000000000000000000000000000000000000000000000000000000001";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: { enabled: true, runs: 200 },
            viaIR: false,
            evmVersion: "paris",       // BSC uses pre-Shanghai EVM (no PUSH0)
        },
    },
    networks: {
        hardhat: {
            forking: {
                url: process.env.BSC_MAINNET_RPC || "https://bsc-dataseed1.binance.org",
                enabled: false,
            },
            chainId: 31337,
        },
        bscTestnet: {
            url: process.env.BSC_TESTNET_RPC || "https://data-seed-prebsc-1-s1.binance.org:8545",
            chainId: 97,
            accounts: [DEPLOYER_PRIVATE_KEY],
            gasPrice: 10_000_000_000,  // 10 gwei
        },
        // alias so `--network bsctest` also works
        bsctest: {
            url: process.env.BSC_TESTNET_RPC || "https://data-seed-prebsc-1-s1.binance.org:8545",
            chainId: 97,
            accounts: [DEPLOYER_PRIVATE_KEY],
            gasPrice: 10_000_000_000,
        },
        bscMainnet: {
            url: process.env.BSC_MAINNET_RPC || "https://bsc-dataseed1.binance.org",
            chainId: 56,
            accounts: [DEPLOYER_PRIVATE_KEY],
            gasPrice: 3_000_000_000,   // 3 gwei
        },
    },
    etherscan: {
        apiKey: {
            bsc: process.env.BSCSCAN_API_KEY || "",
            bscTestnet: process.env.BSCSCAN_API_KEY || "",
        },
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts",
    },
};
