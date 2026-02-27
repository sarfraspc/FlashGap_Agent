/**
 * FlashGap AI — Constants
 */

// ── Token Addresses (BSC Mainnet) ─────────────────────────
export const TOKENS = {
    WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    USDT: '0x55d398326f99059fF775485246999027B3197955',
};

// ── DEX Router Addresses (BSC Mainnet) ────────────────────
export const ROUTERS = {
    PANCAKESWAP: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    BISWAP: '0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8',
};

// ── Chain IDs ─────────────────────────────────────────────
export const CHAINS = {
    BSC_MAINNET: 56,
    BSC_TESTNET: 97,
};

// ── BscScan URLs ──────────────────────────────────────────
export const EXPLORER = {
    [CHAINS.BSC_MAINNET]: 'https://bscscan.com',
    [CHAINS.BSC_TESTNET]: 'https://testnet.bscscan.com',
};

// ── Token metadata for display ────────────────────────────
export const TOKEN_META = {
    [TOKENS.WBNB]: { symbol: 'WBNB', decimals: 18, color: '#F0B90B' },
    [TOKENS.BUSD]: { symbol: 'BUSD', decimals: 18, color: '#F0B90B' },
    [TOKENS.USDT]: { symbol: 'USDT', decimals: 18, color: '#26A17B' },
};

export const ROUTER_META = {
    [ROUTERS.PANCAKESWAP]: { name: 'PancakeSwap', icon: '🥞', color: '#633001' },
    [ROUTERS.BISWAP]: { name: 'BiSwap', icon: '🔄', color: '#1263F1' },
};
