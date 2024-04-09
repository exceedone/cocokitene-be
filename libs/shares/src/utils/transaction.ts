import { RPC_URLS, SupportedChainId } from '@shares/constants'
import configuration from '@shares/config/configuration'
import { Meeting } from '@shares/abis/types'
import { getContract, getWeb3Instance } from '@shares/utils/web3'
import { MEETING_ABI } from '@shares/abis'
import { ProposalDataSendToBlockchainDto } from '@dtos/proposal.dto'
import BN from 'bn.js'
import { UserMeetingDataSendToBlockchainDto } from '@dtos/user-meeting.dto'
import { FileOfProposalDataSendToBlockchainDto } from '@dtos/proposal-file.dto'
import { VotingDataSendToBlockchainDto } from '@dtos/voting.dto'
import { FileOfMeetingDataSendToBlockchainDto } from '@dtos/meeting-file.dto'

export const sendCreateMeetingTransaction = async ({
    meetingId,
    titleMeeting,
    startTimeMeeting,
    endTimeMeeting,
    meetingLink,
    companyId,
    chainId,
    contractAddress,
    shareholdersTotal,
    shareholdersJoined,
    joinedMeetingShares,
    totalMeetingShares,
}: {
    meetingId: number
    titleMeeting: string
    startTimeMeeting: number
    endTimeMeeting: number
    meetingLink: string
    companyId: number
    chainId: SupportedChainId
    contractAddress: string
    shareholdersTotal: number
    shareholdersJoined: number
    joinedMeetingShares: number
    totalMeetingShares: number
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
            .createNoSign(
                meetingId,
                titleMeeting,
                startTimeMeeting,
                endTimeMeeting,
                meetingLink,
                companyId,
                shareholdersTotal,
                shareholdersJoined,
                joinedMeetingShares,
                totalMeetingShares,
            )
            .estimateGas({
                from: adminAddress,
            })
        // add private key
        const web3Instance = getWeb3Instance(provider)
        await web3Instance.eth.accounts.wallet.add(adminPrivateKey)
        const txResult = await meetingContractInstance.methods
            .createNoSign(
                meetingId,
                titleMeeting,
                startTimeMeeting,
                endTimeMeeting,
                meetingLink,
                companyId,
                shareholdersTotal,
                shareholdersJoined,
                joinedMeetingShares,
                totalMeetingShares,
            )
            .send({ from: adminAddress, gas: estimateGas })
        return txResult
    } catch (error) {
        // throw new Error(error);
        console.log('error-----', error)
        return
    }
}

export const sendUpdateProposalMeetingTransaction = async ({
    meetingId,
    chainId,
    contractAddress,
    newProposalData,
    countProcessNumber,
}: {
    meetingId: number
    chainId: SupportedChainId
    contractAddress: string
    newProposalData: ProposalDataSendToBlockchainDto[]
    countProcessNumber: number
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
        const formattedNewProposalArray: [
            string | number | BN,
            string,
            string | number | BN,
            string | number | BN,
            string | number | BN,
        ][] = newProposalData
            ? newProposalData.map((item) => [
                  item.proposalId,
                  item.titleProposal,
                  item.votedQuantity,
                  item.unVotedQuantity,
                  item.notVoteYetQuantity,
              ])
            : []

        const estimateGas = await meetingContractInstance.methods
            .addProposalsNoSign(
                meetingId,
                formattedNewProposalArray,
                countProcessNumber,
            )
            .estimateGas({
                from: adminAddress,
            })

        //add private key
        const web3Instance = getWeb3Instance(provider)
        await web3Instance.eth.accounts.wallet.add(adminPrivateKey)
        const txResult = await meetingContractInstance.methods
            .addProposalsNoSign(
                meetingId,
                formattedNewProposalArray,
                countProcessNumber,
            )
            .send({
                from: adminAddress,
                gas: estimateGas,
            })
        return txResult
    } catch (error) {
        // throw new Error(error);
        console.log('error-----', error)
        return
    }
}

export const sendUpdateParticipantMeetingTransaction = async ({
    meetingId,
    chainId,
    contractAddress,
    newUserParticipateMeetingData,
    countProcessNumber,
}: {
    meetingId: number
    chainId: SupportedChainId
    contractAddress: string
    newUserParticipateMeetingData: UserMeetingDataSendToBlockchainDto[]
    countProcessNumber: number
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

        const formattedNewUserParticipateMeetingArray: [
            string | number | BN,
            string,
            string,
            string,
        ][] = newUserParticipateMeetingData
            ? newUserParticipateMeetingData.map((item) => [
                  item.userId,
                  item.username,
                  item.role,
                  item.status,
              ])
            : []

        const estimateGas = await meetingContractInstance.methods
            .addUserNoSign(
                meetingId,
                formattedNewUserParticipateMeetingArray,
                countProcessNumber,
            )
            .estimateGas({
                from: adminAddress,
            })
        // add private key
        const web3Instance = getWeb3Instance(provider)
        await web3Instance.eth.accounts.wallet.add(adminPrivateKey)

        const txResult = await meetingContractInstance.methods
            .addUserNoSign(
                meetingId,
                formattedNewUserParticipateMeetingArray,
                countProcessNumber,
            )
            .send({
                from: adminAddress,
                gas: estimateGas,
            })

        return txResult
    } catch (error) {
        // throw new Error(error);
        console.log('error-----', error)
        return
    }
}

export const sendUpdateFileOfProposalMeetingTransaction = async ({
    meetingId,
    chainId,
    contractAddress,
    newFileOfProposalData,
    countProcessNumber,
}: {
    meetingId: number
    chainId: SupportedChainId
    contractAddress: string
    newFileOfProposalData: FileOfProposalDataSendToBlockchainDto[]
    countProcessNumber: number
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
        const formattedNewFileOfProposalDataArray: [
            string | number | BN,
            string,
        ][] = newFileOfProposalData
            ? newFileOfProposalData.map((item) => [
                  item.proposalFileId,
                  item.url,
              ])
            : []
        const estimateGas = await meetingContractInstance.methods
            .addFileProposalNoSign(
                meetingId,
                formattedNewFileOfProposalDataArray,
                countProcessNumber,
            )
            .estimateGas({
                from: adminAddress,
            })

        // add private key
        const web3Instance = getWeb3Instance(provider)
        await web3Instance.eth.accounts.wallet.add(adminPrivateKey)

        const txResult = await meetingContractInstance.methods
            .addFileProposalNoSign(
                meetingId,
                formattedNewFileOfProposalDataArray,
                countProcessNumber,
            )
            .send({
                from: adminAddress,
                gas: estimateGas,
            })
        return txResult
    } catch (error) {
        // throw new Error(error);
        console.log('error-----', error)
        return
    }
}

export const sendUpdateParticipantProposal = async ({
    proposalId,
    chainId,
    contractAddress,
    newVotingData,
    countProcessNumber,
}: {
    proposalId: number
    chainId: SupportedChainId
    contractAddress: string
    newVotingData: VotingDataSendToBlockchainDto[]
    countProcessNumber: number
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
        const formattedNewVotingDataArray: [
            userId: number | string | BN,
            result: string,
        ][] = newVotingData
            ? newVotingData.map((item) => [item.userId, item.result])
            : []

        const web3Instance = getWeb3Instance(provider)
        await web3Instance.eth.accounts.wallet.add(adminPrivateKey)
        const estimateGas = await meetingContractInstance.methods
            .addUserProposalNoSign(
                proposalId,
                formattedNewVotingDataArray,
                countProcessNumber,
            )
            .estimateGas({
                from: adminAddress,
            })

        const txResult = await meetingContractInstance.methods
            .addUserProposalNoSign(
                proposalId,
                formattedNewVotingDataArray,
                countProcessNumber,
            )
            .send({
                from: adminAddress,
                gas: estimateGas,
            })
        return txResult
    } catch (error) {
        // throw new Error(error);
        console.log('error-----', error)
        return
    }
}

export const sendUpdateFileOfMeetingTransaction = async ({
    meetingId,
    chainId,
    contractAddress,
    newFileOfMeetingData,
    countProcessNumber,
}: {
    meetingId: number
    chainId: SupportedChainId
    contractAddress: string
    newFileOfMeetingData: FileOfMeetingDataSendToBlockchainDto[]
    countProcessNumber: number
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
        const formattedNewFileOfMeetingDataArray: [
            string | number | BN,
            string,
        ][] = newFileOfMeetingData
            ? newFileOfMeetingData.map((item) => [item.meetingFileId, item.url])
            : []
        const estimateGas = await meetingContractInstance.methods
            .addFileMeetingNoSign(
                meetingId,
                formattedNewFileOfMeetingDataArray,
                countProcessNumber,
            )
            .estimateGas({
                from: adminAddress,
            })

        // add private key
        const web3Instance = getWeb3Instance(provider)
        await web3Instance.eth.accounts.wallet.add(adminPrivateKey)

        const txResult = await meetingContractInstance.methods
            .addFileMeetingNoSign(
                meetingId,
                formattedNewFileOfMeetingDataArray,
                countProcessNumber,
            )
            .send({
                from: adminAddress,
                gas: estimateGas,
            })
        return txResult
    } catch (error) {
        // throw new Error(error);
        console.log('error-----', error)
        return
    }
}
