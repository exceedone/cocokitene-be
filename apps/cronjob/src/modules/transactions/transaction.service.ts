import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { ListFileOfMeeting } from '../cronjob/cronjob.interface'
import {
    MeetingHash,
    MeetingType,
    StatusMeeting,
    UserMeetingStatusEnum,
} from '@shares/constants/meeting.const'
import { MeetingRepository } from '@repositories/meeting.repository'
import { UserMeetingRepository } from '@repositories/user-meeting.repository'
import { ProposalRepository } from '@repositories/proposal.repository'
import { TransactionRepository } from '@repositories/transaction.repository'
import {
    CONTRACT_TYPE,
    RoleBoardMtgEnum,
    RoleMtgEnum,
    TRANSACTION_STATUS,
} from '@shares/constants'
import { httpErrors } from '@shares/exception-filter'

import {
    dateTimeToEpochTime,
    getChainId,
    getContractAddress,
    sendCreateMeetingTransaction,
} from '@shares/utils'
import { VotingRepository } from '@repositories/voting.repository'
import { MeetingFileRepository } from '@repositories/meeting-file.repository'
import { Logger } from 'winston'
import { messageBLCLog } from '@shares/exception-filter/message-log-blc-const'
import { CandidateRepository } from '@repositories/candidate.repository'
import { VotingCandidateRepository } from '@repositories/voting-candidate.repository'
import { hashMd5 } from '@shares/utils/md5'
import { MeetingRoleMtgRepository } from '@repositories/meeting-role-mtg.repository'
import { RoleMtgRepository } from '@repositories/role-mtg.repository'

@Injectable()
export class TransactionService {
    constructor(
        private readonly meetingRepository: MeetingRepository,
        private readonly userMeetingRepository: UserMeetingRepository,
        private readonly proposalRepository: ProposalRepository,
        private readonly votingRepository: VotingRepository,
        private readonly meetingFileRepository: MeetingFileRepository,
        private readonly transactionRepository: TransactionRepository,
        private readonly candidateRepository: CandidateRepository,
        private readonly votingCandidateRepository: VotingCandidateRepository,
        private readonly meetingRoleMtgRepository: MeetingRoleMtgRepository,
        private readonly roleMtgRepository: RoleMtgRepository,

        @Inject('winston')
        private readonly logger: Logger, // private readonly myLoggerService: MyLoggerService,
    ) {}

    async handleAllEndedMeeting(): Promise<void> {
        // get all meeting have status happened and not appeared in Transaction table
        const meetingIdsAppearedInTransaction =
            await this.transactionRepository.getMeetingIdsWithTransactions()

        // console.log('meetingIdsAppearedInTransaction',meetingIdsAppearedInTransaction)

        const listMeetingHappened =
            await this.meetingRepository.findMeetingByStatusAndEndTimeVoting(
                StatusMeeting.HAPPENED,
                meetingIdsAppearedInTransaction,
            )

        // console.log('listMeetingHappened',listMeetingHappened)

        if (!listMeetingHappened || listMeetingHappened.length == 0) {
            // not find meeting have status happened and no appeared in Transaction table
            console.log('No meeting have status happened!')
            return
        }

        await Promise.all([
            ...listMeetingHappened.map(async (meeting) => {
                const companyId = meeting.companyId
                //Meeting file
                const meetingFiles =
                    await this.meetingFileRepository.getMeetingFilesByMeetingId(
                        meeting.id,
                    )
                const listMeetingFile: ListFileOfMeeting[] = meetingFiles.map(
                    (meetingFile) => {
                        return {
                            meetingId: meetingFile.meetingId,
                            meetingFileId: meetingFile.id,
                            url: meetingFile.url,
                            type: meetingFile.fileType,
                            createAt: meetingFile.createdAt,
                            deletedAt: meetingFile.deletedAt,
                        }
                    },
                )

                const listMeetingProposals =
                    await this.proposalRepository.getAllProposalByMtgId(
                        meeting.id,
                    )
                const listMeetingCandidates =
                    await this.candidateRepository.getAllCandidateByMeetingId(
                        meeting.id,
                    )

                const listVoteProposals = []
                const listVoteCandidate = []

                await Promise.all([
                    ...listMeetingProposals.map(async (proposal) => {
                        const listVoteOfProposal =
                            await this.votingRepository.getInternalListVotingByProposalId(
                                proposal.id,
                            )
                        listVoteOfProposal.map((vote) => {
                            listVoteProposals.push(vote)
                        })
                    }),
                    ...listMeetingCandidates.map(async (candidate) => {
                        const listVoteOfCandidate =
                            await this.votingCandidateRepository.getListVotedByCandidateId(
                                candidate.id,
                            )
                        listVoteOfCandidate.map((voteCandidate) => {
                            listVoteCandidate.push(voteCandidate)
                        })
                    }),
                ])

                const listParticipantOfMeeting =
                    await this.userMeetingRepository.getAllIdsParticipantInBoardMeeting(
                        meeting.id,
                    )

                listMeetingFile.sort(
                    (a, b) => a.meetingFileId - b.meetingFileId,
                )
                listMeetingProposals.sort((a, b) => a.id - b.id)
                listVoteProposals.sort((a, b) => a.id - b.id)
                listMeetingCandidates.sort((a, b) => a.id - b.id)
                listVoteCandidate.sort((a, b) => a.id - b.id)
                listParticipantOfMeeting.sort((a, b) => a.id - b.id)

                const voteInformation = await this.calculateVoter(
                    meeting.id,
                    companyId,
                    meeting.type,
                )

                const keyQuery = Date.now() + ''

                const hash_basicMeeting = hashMd5(
                    JSON.stringify({
                        meetingId: meeting.id,
                        companyId: companyId,
                        titleMeeting: meeting.title,
                        meetingLink: meeting.meetingLink,
                        startTimeMeeting: dateTimeToEpochTime(
                            meeting.startTime,
                        ),
                        endTimeMeeting: dateTimeToEpochTime(meeting.endTime),
                        endVotingTime: dateTimeToEpochTime(
                            meeting.endVotingTime,
                        ),
                        status: meeting.status,
                        voterTotal: voteInformation.voterTotal,
                        voterJoined: voteInformation.voterJoined,
                        totalMeetingVote: voteInformation.totalMeetingVote,
                        joinedMeetingVote: voteInformation.joinedMeetingVote,
                    }),
                )

                const hash_fileMeeting = hashMd5(
                    JSON.stringify(listMeetingFile),
                )
                const hash_proposalMeeting = hashMd5(
                    JSON.stringify(listMeetingProposals),
                )
                const hash_proposalVote = hashMd5(
                    JSON.stringify(listVoteProposals),
                )
                const hash_candidateMeeting = hashMd5(
                    JSON.stringify(listMeetingCandidates),
                )
                const hash_candidateVote = hashMd5(
                    JSON.stringify(listVoteCandidate),
                )
                const hash_participantMeeting = hashMd5(
                    JSON.stringify(listParticipantOfMeeting),
                )
                const hash_detailMeeting = hashMd5(
                    JSON.stringify({
                        meetingId: meeting.id,
                        companyId: companyId,
                        titleMeeting: meeting.title,
                        meetingLink: meeting.meetingLink,
                        startTimeMeeting: dateTimeToEpochTime(
                            meeting.startTime,
                        ),
                        endTimeMeeting: dateTimeToEpochTime(meeting.endTime),
                        endVotingTime: dateTimeToEpochTime(
                            meeting.endVotingTime,
                        ),
                        status: meeting.status,
                        voterTotal: voteInformation.voterTotal,
                        voterJoined: voteInformation.voterJoined,
                        totalMeetingVote: voteInformation.totalMeetingVote,
                        joinedMeetingVote: voteInformation.joinedMeetingVote,
                        fileMeeting: listMeetingFile,
                        proposalMeeting: listMeetingProposals,
                        proposalVote: listVoteProposals,
                        candidateMeeting: listMeetingCandidates,
                        candidateVote: listVoteCandidate,
                        participantMeeting: listParticipantOfMeeting,
                    }),
                )

                // get current chain Id
                const currentChainId = getChainId()
                try {
                    await this.transactionRepository.createTransaction({
                        chainId: currentChainId,
                        contractAddress: getContractAddress({
                            type: CONTRACT_TYPE.MEETING,
                            chainId: currentChainId,
                        }),
                        meetingId: meeting.id,
                        keyQuery: keyQuery,
                        detailMeetingHash: hash_detailMeeting,
                        basicInformationMeetingHash: hash_basicMeeting,
                        fileMeetingHash: hash_fileMeeting,
                        proposalMeetingHash: hash_proposalMeeting,
                        votedProposalHash: hash_proposalVote,
                        candidateHash: hash_candidateMeeting,
                        votedCandidateHash: hash_candidateVote,
                        participantHash: hash_participantMeeting,
                    })
                } catch {
                    throw new HttpException(
                        httpErrors.TRANSACTION_CREATE_FAILED,
                        HttpStatus.INTERNAL_SERVER_ERROR,
                    )
                }
            }),
        ])
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

        await Promise.all([
            ...transactionsList.map(async (transaction) => {
                const totalHashMd5: [string, string][] = [
                    [
                        MeetingHash.HASH_MEETING_BASE,
                        transaction.basicInformationMeetingHash,
                    ],
                    [
                        MeetingHash.HASH_MEETING_FILE,
                        transaction.fileMeetingHash,
                    ],
                    [
                        MeetingHash.HASH_MEETING_PROPOSAL,
                        transaction.proposalMeetingHash,
                    ],
                    [
                        MeetingHash.HASH_MEETING_VOTED_PROPOSAL,
                        transaction.votedProposalHash,
                    ],
                    [
                        MeetingHash.HASH_MEETING_CANDIDATE,
                        transaction.candidateHash,
                    ],
                    [
                        MeetingHash.HASH_MEETING_VOTED_CANDIDATE,
                        transaction.votedCandidateHash,
                    ],
                    [
                        MeetingHash.HASH_MEETING_PARTICIPANT,
                        transaction.participantHash,
                    ],
                    [
                        MeetingHash.HASH_DETAIL_MEETING,
                        transaction.detailMeetingHash,
                    ],
                ]

                const txPromises = await sendCreateMeetingTransaction({
                    chainId: transaction.chainId,
                    contractAddress: transaction.contractAddress,
                    keyMeeting: transaction.keyQuery,
                    totalHashMd5: totalHashMd5,
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
            }),
        ])
    }

    async calculateVoter(
        meetingId: number,
        companyId: number,
        meetingType: MeetingType,
    ) {
        const meetingRoleMtgs =
            await this.meetingRoleMtgRepository.getRoleMtgsByMeetingId(
                meetingId,
            )

        const roleMtgs = meetingRoleMtgs
            .map((item) => item.roleMtg)
            .sort((a, b) => a.roleName.localeCompare(b.roleName))

        const participantsPromises = roleMtgs.map(async (roleMtg) => {
            const userMeetings =
                await this.userMeetingRepository.getUserMeetingByMeetingIdAndRole(
                    meetingId,
                    roleMtg.id,
                )

            const userParticipants = userMeetings.map((userMeeting) => {
                return {
                    userDefaultAvatarHashColor:
                        userMeeting.user.defaultAvatarHashColor,
                    userId: userMeeting.user.id,
                    userAvatar: userMeeting.user.avatar,
                    userEmail: userMeeting.user.email,
                    status: userMeeting.status,
                    userJoined:
                        userMeeting.status ===
                        UserMeetingStatusEnum.PARTICIPATE,
                    userShareQuantity: userMeeting.user.shareQuantity,
                }
            })

            return {
                roleMtgId: roleMtg.id,
                roleMtgName: roleMtg.roleName,
                userParticipants: userParticipants,
            }
        })

        const participants = await Promise.all(participantsPromises)

        let voterTotal: number,
            voterJoined: number,
            totalMeetingVote: number,
            joinedMeetingVote: number

        if (meetingType === MeetingType.SHAREHOLDER_MEETING) {
            const roleMtgShareholderId = await this.roleMtgRepository.findOne({
                where: {
                    roleName: RoleMtgEnum.SHAREHOLDER,
                    companyId: companyId,
                },
            })
            const shareholders = participants.find(
                (item) => item.roleMtgId === roleMtgShareholderId.id,
            )

            if (!shareholders) {
                voterTotal = 0
                voterJoined = 0
                totalMeetingVote = 0
                joinedMeetingVote = 0
            } else {
                voterTotal = shareholders.userParticipants.length

                voterJoined = shareholders.userParticipants.reduce(
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

                totalMeetingVote = shareholders.userParticipants.reduce(
                    (accumulator, currentValue) => {
                        if (currentValue.userShareQuantity) {
                            accumulator += Number(
                                currentValue.userShareQuantity,
                            )
                        }
                        return accumulator
                    },
                    0,
                )

                joinedMeetingVote = shareholders.userParticipants.reduce(
                    (accumulator, currentValue) => {
                        if (currentValue.userShareQuantity) {
                            accumulator =
                                currentValue.status ===
                                UserMeetingStatusEnum.PARTICIPATE
                                    ? accumulator +
                                      Number(currentValue.userShareQuantity)
                                    : accumulator
                        }
                        return accumulator
                    },
                    0,
                )
            }
        }
        if (meetingType === MeetingType.BOARD_MEETING) {
            const idOfHostRoleInMtg = meetingRoleMtgs
                .map((item) => item.roleMtg)
                .filter(
                    (role) =>
                        role.roleName.toLocaleUpperCase() ===
                        RoleBoardMtgEnum.HOST.toLocaleUpperCase(),
                )

            const participantBoard = participants
                .filter((item) => item.roleMtgId !== idOfHostRoleInMtg[0]?.id)
                .map((item) => item.userParticipants)
                .flat()

            const participantBoardId = participantBoard.map(
                (participant) => participant.userId,
            )

            const cachedObject = {}
            const uniqueParticipants = participantBoard.filter((obj) => {
                if (!cachedObject[obj.userId]) {
                    cachedObject[obj.userId] = true
                    return true
                }
                return false
            })

            voterTotal = new Set(participantBoardId).size
            if (!voterTotal) {
                voterTotal = 0
                totalMeetingVote = 0
            } else {
                voterJoined = uniqueParticipants.reduce((total, current) => {
                    total =
                        current.status === UserMeetingStatusEnum.PARTICIPATE
                            ? total + 1
                            : total
                    return total
                }, 0)
                joinedMeetingVote = voterJoined
                totalMeetingVote = voterTotal
            }
        }

        return {
            voterTotal: voterTotal,
            voterJoined: voterJoined,
            totalMeetingVote: totalMeetingVote,
            joinedMeetingVote: joinedMeetingVote,
        }
    }
}
