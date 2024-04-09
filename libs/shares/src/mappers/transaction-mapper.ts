import { TransactionRawDto, TransactionResponseData } from '@dtos/mapper.dto'
import { getChainId } from '@shares/utils'

export const TransactionMapper = (
    rawDto: TransactionRawDto,
): TransactionResponseData => ({
    meetingId: rawDto.transactions_meeting_id || 0,
    titleMeeting: rawDto.transactions_title_meeting || '',
    chainId: rawDto.transactions_chain_id || getChainId(),
    contractAddress: rawDto.transactions_contract_address || '',
    meetingLink: rawDto.transactions_meeting_link || '',
    startTimeMeeting: rawDto.transactions_start_time_meeting || 0,
    endTimeMeeting: rawDto.transactions_end_time_meeting || 0,
    companyId: rawDto.transactions_company_id || 0,
    shareholdersJoined: rawDto.transactions_shareholders_joined || 0,
    shareholdersTotal: rawDto.transactions_shareholder_total || 0,
    joinedMeetingShares: rawDto.transactions_joined_meeting_shares || 0,
    totalMeetingShares: rawDto.transactions_total_meeting_shares || 0,
    type: rawDto.transactions_type,
    status: rawDto.transactions_status,
})
