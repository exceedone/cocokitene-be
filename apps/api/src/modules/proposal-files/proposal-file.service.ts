import { ProposalService } from '@api/modules/proposals/proposal.service'
import { CreateProposalFileDto, ProposalFileDto } from '@dtos/proposal-file.dto'
import { ProposalFile } from '@entities/proposal-file'
import {
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    forwardRef,
} from '@nestjs/common'
import { ProposalFileRepository } from '@repositories/proposal-file.repository'
import { httpErrors } from '@shares/exception-filter'

@Injectable()
export class ProposalFileService {
    constructor(
        private readonly proposalFileRepository: ProposalFileRepository,
        @Inject(forwardRef(() => ProposalService))
        private readonly proposalService: ProposalService,
    ) {}

    async createProposalFile(
        createProposalFileDto: CreateProposalFileDto,
    ): Promise<ProposalFile> {
        const { url, proposalId } = createProposalFileDto
        try {
            const createdProposalFile =
                await this.proposalFileRepository.createProposalFile({
                    url,
                    proposalId,
                })
            return createdProposalFile
        } catch (error) {
            throw new HttpException(
                httpErrors.PROPOSAL_FILE_CREATE_FAILED,
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    async deleteAllProposalFiles(proposalId: number): Promise<void> {
        try {
            await this.proposalFileRepository.softDelete({ proposalId })
        } catch (error) {
            throw new HttpException(
                httpErrors.PROPOSAL_FILES_DELETE_FAILED,
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    async updateListProposalFiles(
        proposalId: number,
        proposalFiles: ProposalFileDto[],
    ): Promise<void> {
        const proposal = await this.proposalService.getInternalProposalById(
            proposalId,
        )
        const listCurrentProposalFiles = proposal.proposalFiles
        // list edited
        const listEdited = proposalFiles.filter((file) => !!file.id)
        const listEditedIds = listEdited.map((file) => file.id)
        // list deleted
        const listDeleted = listCurrentProposalFiles.filter(
            (file) => !listEditedIds.includes(file.id),
        )
        // list added
        const listAdded = proposalFiles.filter((file) => !file.id)

        try {
            await Promise.all([
                ...listEdited.map((file) =>
                    this.proposalFileRepository.updateProposalFile(
                        file.id,
                        file,
                    ),
                ),
                ...listDeleted.map((file) =>
                    this.proposalFileRepository.deleteProposalFile(file.id),
                ),
                ...listAdded.map((file) =>
                    this.proposalFileRepository.createProposalFile({
                        ...file,
                        proposalId,
                    }),
                ),
            ])
        } catch (error) {
            throw new HttpException(
                { message: error.message },
                HttpStatus.BAD_REQUEST,
            )
        }
    }
}
