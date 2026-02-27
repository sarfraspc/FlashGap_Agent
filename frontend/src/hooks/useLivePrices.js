/**
 * useLivePrices — Read real-time prices from PancakeSwap & BiSwap
 */
import { useState, useEffect, useRef } from 'react';
import { useReadContracts } from 'wagmi';
import { ROUTER_ABI } from '../config/contracts';
import { TOKENS, ROUTERS, CHAINS } from '../config/constants';
import { parseEther } from 'viem';

const AMOUNT_IN = parseEther('1'); // 1 BUSD

export function useLivePrices() {
    const [history, setHistory] = useState([]);
    const prevKeyRef = useRef(null);

    const { data, isLoading, error } = useReadContracts({
        contracts: [
            {
                address: ROUTERS.PANCAKESWAP,
                abi: ROUTER_ABI,
                functionName: 'getAmountsOut',
                args: [AMOUNT_IN, [TOKENS.WBNB, TOKENS.XVS]],
                chainId: CHAINS.BSC_MAINNET,
            },
            {
                address: ROUTERS.BISWAP,
                abi: ROUTER_ABI,
                functionName: 'getAmountsOut',
                args: [AMOUNT_IN, [TOKENS.WBNB, TOKENS.XVS]],
                chainId: CHAINS.BSC_MAINNET,
            },
        ],
        query: {
            refetchInterval: 5_000,
        },
    });

    const pcsRaw = data?.[0]?.result;
    const biswapRaw = data?.[1]?.result;

    const pcsPrice = pcsRaw ? Number(pcsRaw[1]) / 1e18 : null;
    const biswapPrice = biswapRaw ? Number(biswapRaw[1]) / 1e18 : null;

    const gap =
        pcsPrice !== null && biswapPrice !== null
            ? (Math.abs(pcsPrice - biswapPrice) / Math.max(pcsPrice, biswapPrice)) * 100
            : null;

    // Add to history when data changes (BigInt-safe comparison)
    useEffect(() => {
        const key = `${pcsRaw?.[1]?.toString()}-${biswapRaw?.[1]?.toString()}`;
        if (key === prevKeyRef.current) return;
        prevKeyRef.current = key;

        if (pcsPrice !== null && biswapPrice !== null) {
            setHistory((prev) => [
                ...prev.slice(-29),
                {
                    ts: new Date().toLocaleTimeString(),
                    pancake: pcsPrice,
                    biswap: biswapPrice,
                    gap,
                },
            ]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pcsPrice, biswapPrice]);

    return {
        pcsPrice,
        biswapPrice,
        gap,
        history,
        isLoading,
        error,
        pcsError: data?.[0]?.error,
        biswapError: data?.[1]?.error,
    };
}
