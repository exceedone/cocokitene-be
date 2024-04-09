import { BaseCrawler } from './base-crawler'
import { BlockService } from '../block/block.service'
import { TransactionRepository } from '@repositories/transaction.repository'
import {
    MEETING_EVENT,
    TRANSACTION_STATUS,
    TRANSACTION_TYPE,
} from '@shares/constants'
import { Injectable } from '@nestjs/common'
import { MeetingRepository } from '@repositories/meeting.repository'
import { ProposalRepository } from '@repositories/proposal.repository'

@Injectable()
export class MeetingCrawler extends BaseCrawler {
    constructor(
        blockService: BlockService,
        private readonly transactionRepository: TransactionRepository,
        private readonly meetingRepository: MeetingRepository,
        private readonly proposalRepository: ProposalRepository,
    ) {
        super(blockService)
    }

    async handleEvent(event: any) {
        switch (event['event']) {
            case MEETING_EVENT.CREATE_MEETING:
                await this.onMeetingCreated(event)
                break
            case MEETING_EVENT.UPDATE_PROPOSAL_MEETING:
                await this.onUpdateProposalMeetingTransaction(event)
                break
            case MEETING_EVENT.UPDATE_FILE_OF_PROPOSAL_MEETING:
                await this.onUpdateFileOfProposalMeetingTransaction(event)
                break
            case MEETING_EVENT.UPDATE_FILE_OF_MEETING:
                await this.onUpdateFileOfMeetingTransaction(event)
                break
            case MEETING_EVENT.UPDATE_PARTICIPANT_MEETING:
                await this.onUpdateParticipantMeetingTransaction(event)
                break
            case MEETING_EVENT.UPDATE_PARTICIPANT_PROPOSAL:
                await this.onUpdateParticipantProposal(event)
                break
            default:
                break
        }
    }

    async onMeetingCreated(event: any): Promise<void> {
        const { id_meeting, numberInBlockchain } = event['returnValues']
        console.log({ id_meeting, numberInBlockchain })
        // update transaction
        await this.transactionRepository.updateTransactionByMeetingIdAndType(
            +id_meeting,
            TRANSACTION_TYPE.CREATE_MEETING,
            { status: TRANSACTION_STATUS.SUCCESS },
        )
    }

    async onUpdateProposalMeetingTransaction(event: any): Promise<void> {
        const { id_meeting, step } = event['returnValues']
        console.log({ id_meeting, step })
        // update transaction
        await this.transactionRepository.updateTransactionByMeetingIdAndType(
            +id_meeting,
            TRANSACTION_TYPE.UPDATE_PROPOSAL_MEETING,
            {
                status: TRANSACTION_STATUS.SUCCESS,
            },
        )
    }

    async onUpdateFileOfProposalMeetingTransaction(event: any): Promise<void> {
        const { id_meeting, step } = event['returnValues']
        console.log({ id_meeting, step })
        // update transaction
        await this.transactionRepository.updateTransactionByMeetingIdAndType(
            +id_meeting,
            TRANSACTION_TYPE.UPDATE_FILE_PROPOSAL_MEETING,
            {
                status: TRANSACTION_STATUS.SUCCESS,
            },
        )
    }

    async onUpdateParticipantMeetingTransaction(event: any): Promise<void> {
        const { id_meeting, step } = event['returnValues']
        console.log({ id_meeting, step })
        // update transaction
        await this.transactionRepository.updateTransactionByMeetingIdAndType(
            +id_meeting,
            TRANSACTION_TYPE.UPDATE_USER_PARTICIPATE_MEETING,
            {
                status: TRANSACTION_STATUS.SUCCESS,
            },
        )
    }

    async onUpdateParticipantProposal(event: any): Promise<void> {
        const { id_proposal, step } = event['returnValues']
        console.log({ id_proposal, step })
        // find meeting id what contain proposal id
        const proposal = await this.proposalRepository.getProposalByProposalId(
            +id_proposal,
        )

        const meetingId = proposal.meetingId
        //update transaction
        await this.transactionRepository.updateTransactionByMeetingIdAndType(
            +meetingId,
            TRANSACTION_TYPE.UPDATE_USER_PROPOSAL_MEETING,
            {
                status: TRANSACTION_STATUS.SUCCESS,
            },
        )
    }
    async onUpdateFileOfMeetingTransaction(event: any): Promise<any> {
        const { id_meeting, step } = event['returnValues']
        console.log({ id_meeting, step })
        await this.transactionRepository.updateTransactionByMeetingIdAndType(
            +id_meeting,
            TRANSACTION_TYPE.UPDATE_FILE_OF_MEETING,
            {
                status: TRANSACTION_STATUS.SUCCESS,
            },
        )
    }
}
