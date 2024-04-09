export enum SupportedChainId {
    MAINNET = 1,
    GOERLI = 5,
    SEPOLIA = 11155111,
}

export enum ChainType {
    TESTNET = 'TESTNET',
    MAINNET = 'MAINNET',
}

type RpcUrlsType = {
    [key in SupportedChainId]: string
}

export const RPC_URLS: RpcUrlsType = {
    [SupportedChainId.MAINNET]: `https://mainnet.infura.io/v3/b843ac9a94d3488fb75a8613c656a71f`,
    [SupportedChainId.GOERLI]: `https://goerli.infura.io/v3/b843ac9a94d3488fb75a8613c656a71f`,
    [SupportedChainId.SEPOLIA]: `https://sepolia.infura.io/v3/b843ac9a94d3488fb75a8613c656a71f`,
}
