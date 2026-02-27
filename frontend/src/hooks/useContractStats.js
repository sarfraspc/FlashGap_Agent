/**
 * useContractStats — Read FlashGap contract state
 */
import { useReadContracts } from 'wagmi';
import { FLASHGAP_ADDRESS, FLASHGAP_ABI } from '../config/contracts';
import { CHAINS } from '../config/constants';

export function useContractStats() {
    const contract = {
        address: FLASHGAP_ADDRESS,
        abi: FLASHGAP_ABI,
        chainId: CHAINS.BSC_TESTNET,
    };

    const { data, isLoading, error, refetch } = useReadContracts({
        contracts: [
            { ...contract, functionName: 'totalTrades' },
            { ...contract, functionName: 'totalProfit' },
            { ...contract, functionName: 'minProfitBps' },
            { ...contract, functionName: 'maxSlippageBps' },
            { ...contract, functionName: 'flashFeeNumerator' },
            { ...contract, functionName: 'owner' },
            { ...contract, functionName: 'paused' },
            { ...contract, functionName: 'factoryA' },
        ],
        query: {
            refetchInterval: 15_000,
        },
    });

    return {
        totalTrades: data?.[0]?.result ?? 0n,
        totalProfit: data?.[1]?.result ?? 0n,
        minProfitBps: data?.[2]?.result ?? 0n,
        maxSlippageBps: data?.[3]?.result ?? 0n,
        flashFeeNumerator: data?.[4]?.result ?? 0n,
        owner: data?.[5]?.result ?? null,
        paused: data?.[6]?.result ?? false,
        factoryA: data?.[7]?.result ?? null,
        isLoading,
        error,
        refetch,
    };
}
