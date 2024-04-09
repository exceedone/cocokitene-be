import { ChainType, SupportedChainId } from '@shares/constants'
import configuration from '@shares/config/configuration'

export const getChainId = (): SupportedChainId => {
    return configuration().common.networkEnv === ChainType.MAINNET
        ? SupportedChainId.MAINNET
        : SupportedChainId.SEPOLIA
}
