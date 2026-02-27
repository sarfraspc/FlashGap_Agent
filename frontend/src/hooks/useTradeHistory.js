/**
 * useTradeHistory — Read ArbitrageExecuted events from FlashGap
 */
import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { FLASHGAP_ADDRESS, FLASHGAP_ABI } from '../config/contracts';
import { CHAINS } from '../config/constants';

export function useTradeHistory() {
    const publicClient = usePublicClient({ chainId: CHAINS.BSC_TESTNET });
    const [trades, setTrades] = useState([]);
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
                // Search last 5k blocks to stay within RPC limits
                const fromBlock = currentBlock > 5000n ? currentBlock - 5000n : 0n;

                const logs = await publicClient.getContractEvents({
                    address: FLASHGAP_ADDRESS,
                    abi: FLASHGAP_ABI,
                    eventName: 'ArbitrageExecuted',
                    fromBlock,
                    toBlock: 'latest',
                });

                const parsedTrades = logs
                    .map((log) => ({
                        tokenBorrow: log.args.tokenBorrow,
                        tokenTarget: log.args.tokenTarget,
                        amount: log.args.amount,
                        profit: log.args.profit,
                        routerA: log.args.routerA,
                        routerB: log.args.routerB,
                        timestamp: log.args.timestamp,
                        txHash: log.transactionHash,
                        blockNumber: log.blockNumber,
                    }))
                    .reverse(); // newest first

                setTrades(parsedTrades);
            } catch (err) {
                console.warn('Trade history fetch error:', err.message);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchEvents();
        // Re-fetch every 30s
        const interval = setInterval(fetchEvents, 30_000);
        return () => clearInterval(interval);
    }, [publicClient]);

    return { trades, isLoading, error };
}
