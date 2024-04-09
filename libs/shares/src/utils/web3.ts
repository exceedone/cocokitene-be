import { compareAddress } from '@shares/utils/address'
import { USER_LOGIN_BASE_MESSAGE } from '@shares/constants/auth.const'
/* eslint-disable @typescript-eslint/no-var-requires */
const Web3 = require('web3')

let web3Instance
export const getWeb3Instance = (provider: string) => {
    if (web3Instance) return web3Instance
    web3Instance = new Web3(new Web3.providers.HttpProvider(provider))
    return web3Instance
}

export const getContract = (abi: any, contract: string, provider: string) => {
    const web3Instance = getWeb3Instance(provider)
    return new web3Instance.eth.Contract(abi, contract)
}

export const sleep = (milliseconds: number) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

export const timeOut = async (fn: any, time: number) => {
    await fn()
    await sleep(time)
    await timeOut(fn, time)
}

export const isValidSignature = (
    account: string,
    signature: string,
    message: string,
): boolean => {
    const web3 = new Web3()
    const accountRecover = web3.eth.accounts.recover(message, signature)
    if (!accountRecover || !compareAddress(account, accountRecover)) {
        return false
    }
    return true
}

export const getSignedMessage = (nonce): string => {
    return `${USER_LOGIN_BASE_MESSAGE} - nonce: ${nonce}`
}
