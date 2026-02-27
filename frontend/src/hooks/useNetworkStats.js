/**
 * useNetworkStats — Gas price & block number
 */
import { useGasPrice, useBlockNumber } from 'wagmi';
import { CHAINS } from '../config/constants';

export function useNetworkStats() {
    const { data: gasPrice } = useGasPrice({
        chainId: CHAINS.BSC_MAINNET,
        query: { refetchInterval: 15_000 },
    });

    const { data: blockNumber } = useBlockNumber({
        chainId: CHAINS.BSC_MAINNET,
        query: { refetchInterval: 10_000 },
    });

    return {
        gasPrice,
        blockNumber,
    };
}
