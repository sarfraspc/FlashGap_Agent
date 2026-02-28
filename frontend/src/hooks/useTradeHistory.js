/**
 * useTradeHistory — Read ArbitrageExecuted events from FlashGap
 */
import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { FLASHGAP_ADDRESS, FLASHGAP_ABI } from '../config/contracts';
import { CHAINS } from '../config/constants';

const DEMO_TRADES = [
    { tokenBorrow: 'XVS', tokenTarget: 'WBNB', amount: 1000n, profit: 58000000000000000n, routerA: 'BiSwap', routerB: 'PancakeSwap', timestamp: BigInt(Math.floor(Date.now() / 1000 - 300)), txHash: '0x38260d5616b578a7d7297ea7a7bf25139410ff5add5a707cfacdd600e11d9e6d', blockNumber: 92872913n },
    { tokenBorrow: 'ETH', tokenTarget: 'WBNB', amount: 1000n, profit: 12100000000000000n, routerA: 'BiSwap', routerB: 'PancakeSwap', timestamp: BigInt(Math.floor(Date.now() / 1000 - 1200)), txHash: '0xb4e8e9576eeb9391ee66dfb0da4c15b9862cb01fec0b26f05a16a272e44b7277', blockNumber: 92872600n },
];

export function useTradeHistory() {
    const publicClient = usePublicClient({ chainId: CHAINS.BSC_TESTNET });
    const [trades, setTrades] = useState(DEMO_TRADES); // Initial democratic fallback
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchEvents() {
            if (!publicClient) {
                setIsLoading(false);
                return;
            }

            try {
                const currentBlock = await publicClient.getBlockNumber();
                const fromBlock = currentBlock > 5000n ? currentBlock - 5000n : 0n;

                const logs = await publicClient.getContractEvents({
                    address: FLASHGAP_ADDRESS,
                    abi: FLASHGAP_ABI,
                    eventName: 'ArbitrageExecuted',
                    fromBlock,
                    toBlock: 'latest',
                });

                const parsed = logs.map((log) => ({
                    tokenBorrow: log.args.tokenBorrow,
                    tokenTarget: log.args.tokenTarget,
                    amount: log.args.amount,
                    profit: log.args.profit,
                    routerA: log.args.routerA,
                    routerB: log.args.routerB,
                    timestamp: log.args.timestamp,
                    txHash: log.transactionHash,
                    blockNumber: log.blockNumber,
                })).reverse();

                setTrades(parsed.length > 0 ? parsed : DEMO_TRADES);
            } catch (err) {
                console.warn('Trade history fetch error:', err.message);
                setError(err);
                setTrades(prev => prev.length === 0 ? DEMO_TRADES : prev);
            } finally {
                setIsLoading(false);
            }
        }

        fetchEvents();
        const interval = setInterval(fetchEvents, 30_000);
        return () => clearInterval(interval);
    }, [publicClient]);

    return { trades, isLoading, error, isDemo: trades === DEMO_TRADES };
}
