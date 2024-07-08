import { RPC_URLS, SupportedChainId } from '@shares/constants'
import configuration from '@shares/config/configuration'
import { Meeting } from '@shares/abis/types'
import { getContract, getWeb3Instance } from '@shares/utils/web3'
import { MEETING_ABI } from '@shares/abis'

export const sendCreateMeetingTransaction = async ({
    chainId,
    contractAddress,
    keyMeeting,
    totalHashMd5,
}: {
    chainId: SupportedChainId
    contractAddress: string
    keyMeeting: string
    totalHashMd5: [string, string][]
}) => {
    try {
        const provider = RPC_URLS[chainId]
        const adminAddress = configuration().crawler.adminAddress
        const adminPrivateKey = configuration().crawler.adminPrivateKey
        const meetingContractInstance: Meeting = getContract(
            MEETING_ABI,
            contractAddress,
            provider,
        )
        const estimateGas = await meetingContractInstance.methods
            .createNoSign(keyMeeting, totalHashMd5)
            .estimateGas({
                from: adminAddress,
            })
        // add private key
        const web3Instance = getWeb3Instance(provider)
        await web3Instance.eth.accounts.wallet.add(adminPrivateKey)
        const txResult = await meetingContractInstance.methods
            .createNoSign(keyMeeting, totalHashMd5)
            .send({ from: adminAddress, gas: estimateGas })
        return txResult
    } catch (error) {
        console.log('error-----', error)
        return
    }
}
