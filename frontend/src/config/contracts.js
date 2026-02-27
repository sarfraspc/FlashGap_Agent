/**
 * FlashGap AI — Contract Config
 * ABI + addresses for on-chain reads
 */

// ── Deployed FlashGap contract (BSC Testnet) ──────────────
export const FLASHGAP_ADDRESS = '0xa6acB349c32B59c20c898a025971f9e3080B6bf0';

export const FLASHGAP_ABI = [
    // ── View Functions ──────────────────────────────────────
    {
        name: 'totalTrades',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        name: 'totalProfit',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        name: 'minProfitBps',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        name: 'maxSlippageBps',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        name: 'flashFeeNumerator',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        name: 'FEE_DENOMINATOR',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        name: 'factoryA',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'address' }],
    },
    {
        name: 'owner',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'address' }],
    },
    {
        name: 'paused',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'bool' }],
    },

    // ── Events ──────────────────────────────────────────────
    {
        name: 'ArbitrageExecuted',
        type: 'event',
        inputs: [
            { name: 'tokenBorrow', type: 'address', indexed: true },
            { name: 'tokenTarget', type: 'address', indexed: true },
            { name: 'amount', type: 'uint256', indexed: false },
            { name: 'profit', type: 'uint256', indexed: false },
            { name: 'routerA', type: 'address', indexed: false },
            { name: 'routerB', type: 'address', indexed: false },
            { name: 'timestamp', type: 'uint256', indexed: false },
        ],
    },
];

// ── DEX Router ABI (minimal — getAmountsOut only) ─────────
export const ROUTER_ABI = [
    {
        name: 'getAmountsOut',
        type: 'function',
        stateMutability: 'view',
        inputs: [
            { name: 'amountIn', type: 'uint256' },
            { name: 'path', type: 'address[]' },
        ],
        outputs: [{ name: 'amounts', type: 'uint256[]' }],
    },
];
