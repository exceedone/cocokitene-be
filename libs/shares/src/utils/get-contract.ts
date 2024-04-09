import {
    CONTRACT_BY_CHAIN,
    CONTRACT_TYPE,
    SupportedChainId,
} from '@shares/constants'

export const getContractAddress = ({
    type,
    chainId,
}: {
    type: CONTRACT_TYPE
    chainId: SupportedChainId
}): string => {
    const contractListByChain = CONTRACT_BY_CHAIN[chainId]
    const contract = contractListByChain.find((c) => c.type === type)
    return contract.address?.toLowerCase() || ''
}
