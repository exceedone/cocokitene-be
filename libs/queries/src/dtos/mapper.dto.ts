import { TRANSACTION_STATUS, TRANSACTION_TYPE } from '@shares/constants'

export class TransactionRawDto {
    transactions_title_meeting?: string
    transactions_chain_id?: number
    transactions_contract_address?: string
    transactions_meeting_link?: string
    transactions_meeting_id?: number
    transactions_start_time_meeting?: number
    transactions_end_time_meeting?: number
    transactions_company_id?: number
    transactions_shareholder_total?: number
    transactions_shareholders_joined?: number
    transactions_joined_meeting_shares?: number
    transactions_total_meeting_shares?: number
    transactions_status: TRANSACTION_STATUS
    transactions_type: TRANSACTION_TYPE
}
export class TransactionResponseData {
    meetingId: number
    titleMeeting: string
    chainId: number
    contractAddress: string
    meetingLink: string
    startTimeMeeting: number
    endTimeMeeting: number
    companyId: number
    shareholdersJoined: number
    shareholdersTotal: number
    joinedMeetingShares: number
    totalMeetingShares: number
    type: TRANSACTION_TYPE
    status: TRANSACTION_STATUS
}
