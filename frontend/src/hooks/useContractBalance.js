/**
 * useContractBalance — FlashGap contract BNB balance
 */
import { useBalance } from 'wagmi';
import { FLASHGAP_ADDRESS } from '../config/contracts';
import { CHAINS } from '../config/constants';

export function useContractBalance() {
    const { data, isLoading } = useBalance({
        address: FLASHGAP_ADDRESS,
        chainId: CHAINS.BSC_TESTNET,
        query: { refetchInterval: 30_000 },
    });

    return {
        balance: data,
        isLoading,
    };
}
