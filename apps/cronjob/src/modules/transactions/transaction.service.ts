import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import {
    ListFileOfMeeting,
    ListFileOfProposal,
    MeetingEnded,
    participant,
    ResultVoteProposal,
    ResultVoting,
} from '../cronjob/cronjob.interface'
import {
    MeetingRole,
    StatusMeeting,
    UserMeetingStatusEnum,
} from '@shares/constants/meeting.const'
import { enumToArray } from '@shares/utils/enum'
import { MeetingRepository } from '@repositories/meeting.repository'
import { UserMeetingRepository } from '@repositories/user-meeting.repository'
import { ProposalRepository } from '@repositories/proposal.repository'
import { ProposalFileRepository } from '@repositories/proposal-file.repository'
import { TransactionRepository } from '@repositories/transaction.repository'
import {
    CONTRACT_TYPE,
    SupportedChainId,
    TRANSACTION_STATUS,
    TRANSACTION_TYPE,
} from '@shares/constants'
import { httpErrors } from '@shares/exception-filter'
import { ParticipantMeetingTransactionRepository } from '@repositories/participant-meeting-transaction.repository'
import { ProposalTransactionRepository } from '@repositories/proposal-transaction.repository'
import { FileProposalTransactionRepository } from '@repositories/file-proposal-transaction.repository'
import configuration from '@shares/config/configuration'
import {
    dateTimeToEpochTime,
    getChainId,
    getContractAddress,
    groupObject,
    sendCreateMeetingTransaction,
    sendUpdateFileOfMeetingTransaction,
    sendUpdateFileOfProposalMeetingTransaction,
    sendUpdateParticipantMeetingTransaction,
    sendUpdateParticipantProposal,
    sendUpdateProposalMeetingTransaction,
} from '@shares/utils'
import { TransactionResponseData } from '@dtos/mapper.dto'
import { VotingTransactionRepository } from '@repositories/voting-transaction.repository'
import { VotingRepository } from '@repositories/voting.repository'
import { MeetingFileRepository } from '@repositories/meeting-file.repository'
import { FileMeetingTransactionRepository } from '@repositories/file-meeting-transaction.repository'
import { Logger } from 'winston'
import { messageBLCLog } from '@shares/exception-filter/message-log-blc-const'

@Injectable()
export class TransactionService {
    constructor(
        private readonly meetingRepository: MeetingRepository,
        private readonly userMeetingRepository: UserMeetingRepository,
        private readonly proposalRepository: ProposalRepository,
        private readonly proposalFileRepository: ProposalFileRepository,
        private readonly votingRepository: VotingRepository,
        private readonly meetingFileRepository: MeetingFileRepository,
        private readonly transactionRepository: TransactionRepository,
        private readonly participantMeetingTransactionRepository: ParticipantMeetingTransactionRepository,
        private readonly proposalTransactionRepository: ProposalTransactionRepository,
        private readonly fileOfProposalTransactionRepository: FileProposalTransactionRepository,
        private readonly votingTransactionRepository: VotingTransactionRepository,
        private readonly fileOfMeetingTransactionRepository: FileMeetingTransactionRepository,
        @Inject('winston')
        private readonly logger: Logger, // private readonly myLoggerService: MyLoggerService,
    ) {}
    async handleAllEndedMeeting(): Promise<void> {
        const meetingIdsAppearedInTransaction =
            await this.transactionRepository.getMeetingIdsWithTransactions()
        const listMeetingEnd =
            await this.meetingRepository.findMeetingByStatusAndEndTimeVoting(
                StatusMeeting.HAPPENED,
                meetingIdsAppearedInTransaction,
            )
        if (!listMeetingEnd || listMeetingEnd?.length == 0) {
            console.log('No meeting ends found: ' + new Date())
            // this.logger.debug('[BLC] No meetings found')
            this.logger.debug(
                `${messageBLCLog.NOT_FOUND_MEETING_ENDED.message}`,
            )
            return
        }
        await Promise.all([
            ...listMeetingEnd.map(async (meeting) => {
                const companyId = meeting.companyId
                const listProposal =
                    await this.proposalRepository.getInternalListProposalByMeetingId(
                        meeting.id,
                    )
                const meetingFiles =
                    await this.meetingFileRepository.getMeetingFilesByMeetingId(
                        meeting.id,
                    )
                const listMeetingFiles: ListFileOfMeeting[] = meetingFiles.map(
                    (meetingFile) => {
                        return {
                            meetingId: meetingFile.meetingId,
                            meetingFileId: meetingFile.id,
                            url: meetingFile.url,
                        }
                    },
                )
                const listResultProposalFiles: ListFileOfProposal[] = [],
                    listResultProposals: ResultVoteProposal[] = [],
                    listResultVotings: ResultVoting[] = []

                await Promise.all([
                    ...listProposal.map(async (proposal) => {
                        const votedQuantity = proposal.votedQuantity,
                            unVotedQuantity = proposal.unVotedQuantity,
                            notVoteYetQuantity = proposal.notVoteYetQuantity,
                            proposalId = proposal.id,
                            titleProposal = proposal.title

                        listResultProposals.push({
                            meetingId: meeting.id,
                            titleProposal: titleProposal,
                            proposalId: proposalId,
                            votedQuantity: votedQuantity,
                            unVotedQuantity: unVotedQuantity,
                            notVoteYetQuantity: notVoteYetQuantity,
                        })

                        const [listProposalFile, votings] = await Promise.all([
                            this.proposalFileRepository.getInternalListProposalFileByProposalId(
                                proposal.id,
                            ),
                            this.votingRepository.getInternalListVotingByProposalId(
                                proposal.id,
                            ),
                        ])

                        await Promise.all([
                            ...listProposalFile.map((item) => {
                                const proposalFileId = item.id,
                                    proposalId = item.proposalId,
                                    url = item.url
                                listResultProposalFiles.push({
                                    meetingId: meeting.id,
                                    proposalFileId: proposalFileId,
                                    proposalId: proposalId,
                                    url: url,
                                })
                            }),
                            ...votings.map((voting) => {
                                const userId = voting.userId,
                                    result = voting.result,
                                    votingId = voting.id
                                listResultVotings.push({
                                    userId: userId,
                                    proposalId: proposal.id,
                                    result: result,
                                    votingId: votingId,
                                })
                            }),
                        ])
                    }),
                ])

                const [
                    hosts,
                    controlBoards,
                    directors,
                    administrativeCouncils,
                    shareholders,
                ] = await Promise.all(
                    enumToArray(MeetingRole).map((role) =>
                        this.userMeetingRepository.getUserMeetingByMeetingIdAndRole(
                            meeting.id,
                            role,
                        ),
                    ),
                )
                const shareholdersTotal = shareholders.length
                const shareholdersJoined = shareholders.reduce(
                    (accumulator, currentValue) => {
                        accumulator =
                            currentValue.status ===
                            UserMeetingStatusEnum.PARTICIPATE
                                ? accumulator + 1
                                : accumulator
                        return accumulator
                    },
                    0,
                )
                const totalMeetingShares = shareholders.reduce(
                    (accumulator, currentValue) => {
                        accumulator += Number(currentValue.user.shareQuantity)
                        return accumulator
                    },
                    0,
                )

                const joinedMeetingShares = shareholders.reduce(
                    (accumulator, currentValue) => {
                        accumulator =
                            currentValue.status ===
                            UserMeetingStatusEnum.PARTICIPATE
                                ? accumulator +
                                  Number(currentValue.user.shareQuantity)
                                : accumulator
                        return accumulator
                    },
                    0,
                )

                const participants: participant[] = []
                await Promise.all([
                    ...hosts.map((host) =>
                        participants.push({
                            meetingId: meeting.id,
                            userId: host.user.id,
                            username: host.user.username,
                            role: MeetingRole.HOST,
                            status: host.status,
                        }),
                    ),
                    ...controlBoards.map((controlBoard) =>
                        participants.push({
                            meetingId: meeting.id,

                            userId: controlBoard.user.id,
                            username: controlBoard.user.username,
                            role: MeetingRole.CONTROL_BOARD,
                            status: controlBoard.status,
                        }),
                    ),
                    ...directors.map((director) =>
                        participants.push({
                            meetingId: meeting.id,

                            userId: director.user.id,
                            username: director.user.username,
                            role: MeetingRole.DIRECTOR,
                            status: director.status,
                        }),
                    ),
                    ...administrativeCouncils.map((administrativeCouncil) =>
                        participants.push({
                            meetingId: meeting.id,
                            userId: administrativeCouncil.user.id,
                            username: administrativeCouncil.user.username,
                            role: MeetingRole.ADMINISTRATIVE_COUNCIL,
                            status: administrativeCouncil.status,
                        }),
                    ),
                    ...shareholders.map((shareholder) =>
                        participants.push({
                            meetingId: meeting.id,
                            userId: shareholder.user.id,
                            username: shareholder.user.username,
                            role: MeetingRole.SHAREHOLDER,
                            status: shareholder.status,
                        }),
                    ),
                ])
                const meetingEnd: MeetingEnded = {
                    meetingId: meeting.id,
                    companyId: companyId,
                    titleMeeting: meeting.title,
                    meetingLink: meeting.meetingLink,
                    startTimeMeeting: dateTimeToEpochTime(meeting.startTime),
                    endTimeMeeting: dateTimeToEpochTime(meeting.endTime),
                    participants: participants,
                    listResultProposals: listResultProposals,
                    listResultProposalFiles: listResultProposalFiles,
                    listResultVotings: listResultVotings,
                    listResultMeetingFiles: listMeetingFiles,
                    shareholdersTotal: shareholdersTotal,
                    shareholdersJoined: shareholdersJoined,
                    joinedMeetingShares: joinedMeetingShares,
                    totalMeetingShares: totalMeetingShares,
                }
                // get current chain Id
                const currentChainId = getChainId()
                try {
                    await this.transactionRepository.createTransaction({
                        meetingId: meetingEnd.meetingId,
                        titleMeeting: meetingEnd.titleMeeting,
                        meetingLink: meetingEnd.meetingLink,
                        totalMeetingShares: meetingEnd.totalMeetingShares,
                        joinedMeetingShares: meetingEnd.joinedMeetingShares,
                        shareholdersTotal: meetingEnd.shareholdersTotal,
                        shareholdersJoined: meetingEnd.shareholdersJoined,
                        startTimeMeeting: meetingEnd.startTimeMeeting,
                        endTimeMeeting: meetingEnd.endTimeMeeting,
                        companyId: meetingEnd.companyId,
                        chainId: currentChainId,
                        type: TRANSACTION_TYPE.CREATE_MEETING,
                        contractAddress: getContractAddress({
                            type: CONTRACT_TYPE.MEETING,
                            chainId: currentChainId,
                        }),
                    })
                } catch (error) {
                    throw new HttpException(
                        httpErrors.TRANSACTION_CREATE_FAILED,
                        HttpStatus.INTERNAL_SERVER_ERROR,
                    )
                }
                try {
                    await Promise.all([
                        ...meetingEnd.participants.map((participant) =>
                            this.participantMeetingTransactionRepository.createParticipantMeetingTransaction(
                                {
                                    meetingId: participant.meetingId,
                                    userId: participant.userId,
                                    username: participant.username,
                                    status: participant.status,
                                    role: participant.role,
                                },
                            ),
                        ),
                        ...meetingEnd.listResultProposals.map(
                            (listResultProposal) =>
                                this.proposalTransactionRepository.createProposalTransaction(
                                    {
                                        proposalId:
                                            listResultProposal.proposalId,
                                        meetingId: meetingEnd.meetingId,
                                        titleProposal:
                                            listResultProposal.titleProposal,
                                        title: listResultProposal.titleProposal,
                                        votedQuantity:
                                            listResultProposal.votedQuantity ??
                                            0,
                                        unVotedQuantity:
                                            listResultProposal.unVotedQuantity ??
                                            0,
                                        notVoteYetQuantity:
                                            listResultProposal.notVoteYetQuantity ??
                                            0,
                                    },
                                ),
                        ),
                        ...meetingEnd.listResultProposalFiles.map(
                            (listResultProposalFile) =>
                                this.fileOfProposalTransactionRepository.createFileOfProposalTransaction(
                                    {
                                        url: listResultProposalFile.url,
                                        meetingId: meetingEnd.meetingId,
                                        proposalFileId:
                                            listResultProposalFile.proposalFileId,
                                    },
                                ),
                        ),
                        ...meetingEnd.listResultVotings.map(
                            (listResultVoting) =>
                                this.votingTransactionRepository.createVotingTransaction(
                                    {
                                        userId: listResultVoting.userId,
                                        result: listResultVoting.result,
                                        votingId: listResultVoting.votingId,
                                        proposalId: listResultVoting.proposalId,
                                    },
                                ),
                        ),
                        ...meetingEnd.listResultMeetingFiles.map(
                            (listResultMeetingFile) =>
                                this.fileOfMeetingTransactionRepository.createFileOfMeetingTransaction(
                                    {
                                        url: listResultMeetingFile.url,
                                        meetingId:
                                            listResultMeetingFile.meetingId,
                                        meetingFileId:
                                            listResultMeetingFile.meetingFileId,
                                    },
                                ),
                        ),
                    ])
                } catch (error) {
                    throw new HttpException(
                        { message: error.message },
                        HttpStatus.INTERNAL_SERVER_ERROR,
                    )
                }
            }),
        ])
    }

    async handleDataAfterEventSuccessfulCreatedMeeting() {
        const transactionsCreateMeetingSuccessful =
            await this.transactionRepository.getTransactionsCreateMeetingSuccessful()

        if (
            !transactionsCreateMeetingSuccessful ||
            transactionsCreateMeetingSuccessful?.length == 0
        ) {
            console.log(
                'No meeting creation event has been successful: ' + new Date(),
            )
            // this.logger.debug(
            //     '[BLC] No meeting creation event has been successful',
            // )
            this.logger.debug(
                `${messageBLCLog.NOT_FOUND_MEETING_CREATE.message}`,
            )
            return
        }

        const maximumNumberTransactionCallFuncBlockchain =
                configuration().transaction
                    .maximumNumberTransactionPerCallFuncBlockchain,
            currentChainId = getChainId()
        await Promise.all([
            ...transactionsCreateMeetingSuccessful.map(async (transaction) => {
                const [
                    proposals,
                    fileOfProposals,
                    participants,
                    fileOfMeetings,
                ] = await Promise.all([
                    this.proposalTransactionRepository.getProposalTransactionsByMeetingId(
                        transaction.meetingId,
                    ),
                    this.fileOfProposalTransactionRepository.getFileOfProposalTransactionsByMeetingId(
                        transaction.meetingId,
                    ),
                    this.participantMeetingTransactionRepository.getParticipantsMeetingTransactionsByMeetingId(
                        transaction.meetingId,
                    ),
                    this.fileOfMeetingTransactionRepository.getFileOfMeetingTransactionsByMeetingId(
                        transaction.meetingId,
                    ),
                ])

                const countCallFuncAddProposals = Math.ceil(
                        proposals.length /
                            maximumNumberTransactionCallFuncBlockchain,
                    ),
                    countCallFuncFileOfProposal = Math.ceil(
                        fileOfProposals.length /
                            maximumNumberTransactionCallFuncBlockchain,
                    ),
                    countCallFuncParticipant = Math.ceil(
                        participants.length /
                            maximumNumberTransactionCallFuncBlockchain,
                    ),
                    countCallFuncFileOfMeeting = Math.ceil(
                        fileOfMeetings.length /
                            maximumNumberTransactionCallFuncBlockchain,
                    )
                const addProposalsPromises = []
                const fileOfProposalPromises = []
                const participantPromises = []
                const fileOfMeetingPromises = []
                for (let i = 0; i < countCallFuncAddProposals; i++) {
                    addProposalsPromises.push(
                        this.createTransactionSecondaryAndUpdate(
                            TRANSACTION_TYPE.UPDATE_PROPOSAL_MEETING,
                            transaction,
                            currentChainId,
                        ),
                    )
                }
                for (let i = 0; i < countCallFuncFileOfProposal; i++) {
                    fileOfProposalPromises.push(
                        this.createTransactionSecondaryAndUpdate(
                            TRANSACTION_TYPE.UPDATE_FILE_PROPOSAL_MEETING,
                            transaction,
                            currentChainId,
                        ),
                    )
                }
                for (let i = 0; i < countCallFuncParticipant; i++) {
                    participantPromises.push(
                        this.createTransactionSecondaryAndUpdate(
                            TRANSACTION_TYPE.UPDATE_USER_PARTICIPATE_MEETING,
                            transaction,
                            currentChainId,
                        ),
                    )
                }
                for (let i = 0; i < countCallFuncFileOfMeeting; i++) {
                    fileOfMeetingPromises.push(
                        this.createTransactionSecondaryAndUpdate(
                            TRANSACTION_TYPE.UPDATE_FILE_OF_MEETING,
                            transaction,
                            currentChainId,
                        ),
                    )
                }

                await Promise.all([
                    ...addProposalsPromises,
                    ...fileOfProposalPromises,
                    ...participantPromises,
                    ...fileOfMeetingPromises,
                ])
            }),
        ])
    }

    async createTransactionSecondaryAndUpdate(
        type: TRANSACTION_TYPE,
        transaction: TransactionResponseData,
        chainId: SupportedChainId,
    ) {
        try {
            await this.transactionRepository.createTransaction({
                meetingId: transaction.meetingId,
                titleMeeting: transaction.titleMeeting,
                meetingLink: transaction.meetingLink,
                totalMeetingShares: transaction.totalMeetingShares,
                joinedMeetingShares: transaction.joinedMeetingShares,
                shareholdersTotal: transaction.shareholdersTotal,
                shareholdersJoined: transaction.shareholdersJoined,
                startTimeMeeting: transaction.startTimeMeeting,
                endTimeMeeting: transaction.endTimeMeeting,
                companyId: transaction.companyId,
                chainId: chainId,
                type: type,
                contractAddress: getContractAddress({
                    type: CONTRACT_TYPE.MEETING,
                    chainId: chainId,
                }),
            })
        } catch (error) {
            switch (type) {
                case TRANSACTION_TYPE.UPDATE_PROPOSAL_MEETING:
                    throw new HttpException(
                        httpErrors.TRANSACTION_CREATE_PROPOSAL_FAILED,
                        HttpStatus.INTERNAL_SERVER_ERROR,
                    )
                    break
                case TRANSACTION_TYPE.UPDATE_USER_PARTICIPATE_MEETING:
                    throw new HttpException(
                        httpErrors.TRANSACTION_CREATE_PARTICIPANT_MEETING_FAILED,
                        HttpStatus.INTERNAL_SERVER_ERROR,
                    )
                    break
                case TRANSACTION_TYPE.UPDATE_FILE_PROPOSAL_MEETING:
                    throw new HttpException(
                        httpErrors.TRANSACTION_CREATE_FILE_OF_PROPOSAL_FAILED,
                        HttpStatus.INTERNAL_SERVER_ERROR,
                    )
                    break
                case TRANSACTION_TYPE.UPDATE_USER_PROPOSAL_MEETING:
                    throw new HttpException(
                        httpErrors.TRANSACTION_CREATE_VOTING_PROPOSAL_FAILED,
                        HttpStatus.INTERNAL_SERVER_ERROR,
                    )
                    break

                default:
                    throw new HttpException(
                        {
                            message: error.message,
                        },
                        HttpStatus.INTERNAL_SERVER_ERROR,
                    )
            }
        }
    }
    async handleCheckTransaction() {
        const transactionsList =
            await this.transactionRepository.findTransactionByStatus(
                TRANSACTION_STATUS.PENDING,
            )
        if (!transactionsList || transactionsList?.length === 0) {
            console.log('No transactions found: ' + new Date())
            this.logger.debug(
                `${messageBLCLog.NOT_FOUND_TRANSACTION_PENDING.message}`,
            )
            return
        }
        const maximumNumberTransactionCallFuncBlockchain =
            configuration().transaction
                .maximumNumberTransactionPerCallFuncBlockchain

        await Promise.all([
            ...transactionsList.map(async (transaction) => {
                if (transaction.type === TRANSACTION_TYPE.CREATE_MEETING) {
                    const txPromises = await sendCreateMeetingTransaction({
                        meetingId: transaction.meetingId,
                        titleMeeting: transaction.titleMeeting,
                        startTimeMeeting: transaction.startTimeMeeting,
                        endTimeMeeting: transaction.endTimeMeeting,
                        meetingLink: transaction.meetingLink,
                        companyId: transaction.companyId,
                        chainId: transaction.chainId,
                        shareholdersJoined: transaction.shareholdersJoined,
                        shareholdersTotal: transaction.shareholdersTotal,
                        joinedMeetingShares: transaction.joinedMeetingShares,
                        totalMeetingShares: transaction.totalMeetingShares,
                        contractAddress: transaction.contractAddress,
                    })
                    if (txPromises) {
                        console.log(
                            `${messageBLCLog.SENT_TRANSACTION_MEETING_ENDED.message}` +
                                txPromises?.transactionHash,
                        )
                        this.logger.info(
                            `${messageBLCLog.SENT_TRANSACTION_MEETING_ENDED.message} ${txPromises?.transactionHash}`,
                        )
                        await this.transactionRepository.updateTransaction(
                            transaction.id,
                            {
                                txHash: txPromises?.transactionHash,
                                status: TRANSACTION_STATUS.PROCESSING,
                            },
                        )
                    }
                }
                if (
                    transaction.type ===
                    TRANSACTION_TYPE.UPDATE_PROPOSAL_MEETING
                ) {
                    const proposals =
                        await this.proposalTransactionRepository.getProposalTransactionsByMeetingId(
                            transaction.meetingId,
                        )
                    const groupedProposals = groupObject(
                        proposals,
                        maximumNumberTransactionCallFuncBlockchain,
                    )
                    const countCallFuncAddProposals = Math.ceil(
                        proposals.length /
                            maximumNumberTransactionCallFuncBlockchain,
                    )
                    for (let i = 1; i <= countCallFuncAddProposals; i++) {
                        const txPromises =
                            await sendUpdateProposalMeetingTransaction({
                                meetingId: transaction.meetingId,
                                chainId: transaction.chainId,
                                contractAddress: transaction.contractAddress,
                                newProposalData: groupedProposals[i - 1],
                                countProcessNumber: i,
                            })
                        if (txPromises) {
                            console.log(
                                `${messageBLCLog.SENT_PROPOSAL_TRANSACTION_MEETING_ENDED.message}` +
                                    txPromises?.transactionHash,
                            )
                            this.logger.info(
                                `${messageBLCLog.SENT_PROPOSAL_TRANSACTION_MEETING_ENDED.message} ${txPromises?.transactionHash}`,
                            )

                            await this.transactionRepository.updateTransaction(
                                transaction.id,
                                {
                                    txHash: txPromises?.transactionHash,
                                    status: TRANSACTION_STATUS.PROCESSING,
                                },
                            )
                        }
                    }
                }
                if (
                    transaction.type ===
                    TRANSACTION_TYPE.UPDATE_FILE_PROPOSAL_MEETING
                ) {
                    const fileOfProposals =
                        await this.fileOfProposalTransactionRepository.getFileOfProposalTransactionsByMeetingId(
                            transaction.meetingId,
                        )
                    const groupedFileOfProposals = groupObject(
                        fileOfProposals,
                        maximumNumberTransactionCallFuncBlockchain,
                    )
                    const countCallFuncFileOfProposal = Math.ceil(
                        fileOfProposals.length /
                            maximumNumberTransactionCallFuncBlockchain,
                    )
                    for (let i = 1; i <= countCallFuncFileOfProposal; i++) {
                        const txPromises =
                            await sendUpdateFileOfProposalMeetingTransaction({
                                meetingId: transaction.meetingId,
                                chainId: transaction.chainId,
                                contractAddress: transaction.contractAddress,
                                newFileOfProposalData:
                                    groupedFileOfProposals[i - 1],
                                countProcessNumber: i,
                            })
                        if (txPromises) {
                            console.log(
                                'Sent transaction: ' +
                                    txPromises?.transactionHash,
                            )
                            this.logger.info(
                                `${messageBLCLog.SENT_FILE_PROPOSAL_TRANSACTION_MEETING_ENDED.message} ${txPromises?.transactionHash}`,
                            )

                            await this.transactionRepository.updateTransaction(
                                transaction.id,
                                {
                                    txHash: txPromises?.transactionHash,
                                    status: TRANSACTION_STATUS.PROCESSING,
                                },
                            )
                        }
                    }
                }

                if (
                    transaction.type === TRANSACTION_TYPE.UPDATE_FILE_OF_MEETING
                ) {
                    const fileOfMeetings =
                        await this.fileOfMeetingTransactionRepository.getFileOfMeetingTransactionsByMeetingId(
                            transaction.meetingId,
                        )
                    const groupedFileOfMeetings = groupObject(
                        fileOfMeetings,
                        maximumNumberTransactionCallFuncBlockchain,
                    )
                    const countCallFuncFileOfMeeting = Math.ceil(
                        fileOfMeetings.length /
                            maximumNumberTransactionCallFuncBlockchain,
                    )
                    for (let i = 1; i <= countCallFuncFileOfMeeting; i++) {
                        const txPromises =
                            await sendUpdateFileOfMeetingTransaction({
                                meetingId: transaction.meetingId,
                                chainId: transaction.chainId,
                                contractAddress: transaction.contractAddress,
                                newFileOfMeetingData:
                                    groupedFileOfMeetings[i - 1],
                                countProcessNumber: i,
                            })
                        if (txPromises) {
                            console.log(
                                `${messageBLCLog.SENT_TRANSACTION_FILE_MEETING_ENDED.message}` +
                                    txPromises?.transactionHash,
                            )
                            this.logger.info(
                                `${messageBLCLog.SENT_TRANSACTION_FILE_MEETING_ENDED.message} ${txPromises?.transactionHash}`,
                            )

                            await this.transactionRepository.updateTransaction(
                                transaction.id,
                                {
                                    txHash: txPromises?.transactionHash,
                                    status: TRANSACTION_STATUS.PROCESSING,
                                },
                            )
                        }
                    }
                }

                if (
                    transaction.type ===
                    TRANSACTION_TYPE.UPDATE_USER_PARTICIPATE_MEETING
                ) {
                    const participantMeetingTransactions =
                        await this.participantMeetingTransactionRepository.getParticipantsMeetingTransactionsByMeetingId(
                            transaction.meetingId,
                        )
                    const groupedParticipantMeetings = groupObject(
                        participantMeetingTransactions,
                        maximumNumberTransactionCallFuncBlockchain,
                    )
                    const countCallFuncParticipant = Math.ceil(
                        participantMeetingTransactions.length /
                            maximumNumberTransactionCallFuncBlockchain,
                    )
                    for (let i = 1; i <= countCallFuncParticipant; i++) {
                        const txPromises =
                            await sendUpdateParticipantMeetingTransaction({
                                meetingId: transaction.meetingId,
                                chainId: transaction.chainId,
                                contractAddress: transaction.contractAddress,
                                newUserParticipateMeetingData:
                                    groupedParticipantMeetings[i - 1],
                                countProcessNumber: i,
                            })
                        if (txPromises) {
                            console.log(
                                'Sent  transaction: ' +
                                    txPromises?.transactionHash,
                            )
                            this.logger.info(
                                `${messageBLCLog.SENT_TRANSACTION_PARTICIPANT_MEETING_ENDED.message} ${txPromises?.transactionHash}`,
                            )

                            await this.transactionRepository.updateTransaction(
                                transaction.id,
                                {
                                    txHash: txPromises?.transactionHash,
                                    status: TRANSACTION_STATUS.PROCESSING,
                                },
                            )
                        }
                    }
                }
                if (
                    transaction.type ===
                    TRANSACTION_TYPE.UPDATE_USER_PROPOSAL_MEETING
                ) {
                    const { meetingId } = transaction
                    const proposalTransactionPushedBlockchainSuccess =
                        await this.proposalTransactionRepository.getProposalTransactionsByMeetingId(
                            meetingId,
                        )
                    await Promise.all([
                        ...proposalTransactionPushedBlockchainSuccess.map(
                            async (proposalTransaction) => {
                                const { proposalId } = proposalTransaction
                                const votingTransactions =
                                    await this.votingTransactionRepository.getVotingTransactionByProposalId(
                                        proposalId,
                                    )

                                const groupedVotings = groupObject(
                                    votingTransactions,
                                    maximumNumberTransactionCallFuncBlockchain,
                                )

                                const countCallFuncAddUserProposals = Math.ceil(
                                    votingTransactions.length /
                                        maximumNumberTransactionCallFuncBlockchain,
                                )

                                for (
                                    let j = 1;
                                    j <= countCallFuncAddUserProposals;
                                    j++
                                ) {
                                    const txPromises =
                                        await sendUpdateParticipantProposal({
                                            proposalId: proposalId,
                                            chainId: transaction.chainId,
                                            contractAddress:
                                                transaction.contractAddress,
                                            newVotingData:
                                                groupedVotings[j - 1],
                                            countProcessNumber: j,
                                        })
                                    if (txPromises) {
                                        console.log(
                                            `${messageBLCLog.SENt_TRANSACTION_USER_PROPOSAL_MEETING_ENDED.message}` +
                                                txPromises?.transactionHash,
                                        )
                                        this.logger.info(
                                            `${messageBLCLog.SENt_TRANSACTION_USER_PROPOSAL_MEETING_ENDED.message} ${txPromises?.transactionHash}`,
                                        )
                                        await this.transactionRepository.updateTransaction(
                                            transaction.id,
                                            {
                                                txHash: txPromises?.transactionHash,
                                                status: TRANSACTION_STATUS.PROCESSING,
                                            },
                                        )
                                    }
                                }
                            },
                        ),
                    ])
                }
            }),
        ])
    }

    async handleDataAfterEventSuccessfulUpdateProposalMeeting() {
        const transactionsUpdateProposalMeetingSuccessful =
            await this.transactionRepository.transactionsUpdateProposalMeetingSuccessful()
        if (
            !transactionsUpdateProposalMeetingSuccessful ||
            transactionsUpdateProposalMeetingSuccessful?.length == 0
        ) {
            console.log(
                `${messageBLCLog.NO_UPDATE_PROPOSAL_MEETING_ENDED.message}}` +
                    new Date(),
            )
            this.logger.debug(
                messageBLCLog.NO_UPDATE_PROPOSAL_MEETING_ENDED.message,
            )
            return
        }
        const maximumNumberTransactionCallFuncBlockchain =
                configuration().transaction
                    .maximumNumberTransactionPerCallFuncBlockchain,
            currentChainId = getChainId()
        await Promise.all([
            ...transactionsUpdateProposalMeetingSuccessful.map(
                async (transaction) => {
                    const { meetingId } = transaction
                    const proposalTransactions =
                        await this.proposalTransactionRepository.getProposalTransactionsByMeetingId(
                            meetingId,
                        )

                    await Promise.all([
                        ...proposalTransactions.map(
                            async (proposalTransaction) => {
                                const { proposalId } = proposalTransaction
                                const votingTransactions =
                                    await this.votingTransactionRepository.getVotingTransactionByProposalId(
                                        proposalId,
                                    )
                                const countCallFuncAddUserProposals = Math.ceil(
                                    votingTransactions.length /
                                        maximumNumberTransactionCallFuncBlockchain,
                                )
                                const addUserProposalPromises = []

                                for (
                                    let i = 0;
                                    i < countCallFuncAddUserProposals;
                                    i++
                                ) {
                                    addUserProposalPromises.push(
                                        this.createTransactionSecondaryAndUpdate(
                                            TRANSACTION_TYPE.UPDATE_USER_PROPOSAL_MEETING,
                                            transaction,
                                            currentChainId,
                                        ),
                                    )
                                }
                                await Promise.all([...addUserProposalPromises])
                            },
                        ),
                    ])
                },
            ),
        ])
    }
}
