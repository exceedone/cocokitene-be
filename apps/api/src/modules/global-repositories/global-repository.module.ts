import { Global, Module } from '@nestjs/common'
import { CompanyStatusRepository } from '@repositories/company-status.repository'
import { CompanyRepository } from '@repositories/company.repository'
import { MeetingFileRepository } from '@repositories/meeting-file.repository'
import { MeetingRepository } from '@repositories/meeting.repository'
import { PlanRepository } from '@repositories/plan.repository'
import { ProposalFileRepository } from '@repositories/proposal-file.repository'
import { ProposalRepository } from '@repositories/meeting-proposal.repository'
import { RoleRepository } from '@repositories/role.repository'
import { SystemAdminRepository } from '@repositories/system-admin.repository'
import { UserMeetingRepository } from '@repositories/meeting-participant.repository'
import { UserRoleRepository } from '@repositories/user-role.repository'
import { UserStatusRepository } from '@repositories/user-status.repository'
import { UserRepository } from '@repositories/user.repository'
import { VotingRepository } from '@repositories/voting.repository'
import { ShareholderRepository } from '@repositories/shareholder.repository'
import { TypeOrmExModule } from '@shares/modules'
import { PermissionRepository } from '@repositories/permission.repository'
import { RolePermissionRepository } from '@repositories/role-permission.repository'
import { TransactionRepository } from '@repositories/transaction.repository'
import { VotingCandidateRepository } from '@repositories/voting-board-members.repository'
import { ElectionRepository } from '@repositories/election.repository'
import { CandidateRepository } from '@repositories/nominees.repository'
import { MeetingRoleMtgRepository } from '@repositories/meeting-role-relations.repository'
import { RoleMtgRepository } from '@repositories/meeting-role.repository'
import { MessageRepository } from '@repositories/message.repository'
import { ChatPermissionRepository } from '@repositories/chat-permission.repository'
import { ReactionMessagesRepository } from '@repositories/reaction-messages.repository'
import { ReactionIconRepository } from '@repositories/reaction-icon.repository'
import { UserSeenMessageRepository } from '@repositories/seen-messages.repository'
import { PersonnelVotingRepository } from '@repositories/personnel-voting.repository'
import { SystemNotificationRepository } from '@repositories/system-notification.repository'

const commonRepositories = [
    UserRepository,
    UserStatusRepository,
    RoleRepository,
    UserRoleRepository,
    MeetingRepository,
    UserMeetingRepository,
    MeetingFileRepository,
    ProposalRepository,
    VotingRepository,
    SystemAdminRepository,
    CompanyRepository,
    PlanRepository,
    CompanyStatusRepository,
    PlanRepository,
    ProposalFileRepository,
    PermissionRepository,
    RolePermissionRepository,
    ShareholderRepository,
    TransactionRepository,
    VotingCandidateRepository,
    ElectionRepository,
    CandidateRepository,
    RoleMtgRepository,
    MeetingRoleMtgRepository,
    MessageRepository,
    ChatPermissionRepository,
    ReactionMessagesRepository,
    ReactionIconRepository,
    UserSeenMessageRepository,
    PersonnelVotingRepository,
    SystemNotificationRepository,
]

@Global()
@Module({
    imports: [TypeOrmExModule.forCustomRepository(commonRepositories)],
    exports: [TypeOrmExModule],
})
export class GlobalRepository {}
