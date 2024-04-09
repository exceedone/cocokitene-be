import { CreateProposalFileDto, ProposalFileDto } from '@dtos/proposal-file.dto'
import { ProposalFile } from '@entities/proposal-file'
import { CustomRepository } from '@shares/decorators'
import { Repository } from 'typeorm'

@CustomRepository(ProposalFile)
export class ProposalFileRepository extends Repository<ProposalFile> {
    async createProposalFile(
        createProposalFileDto: CreateProposalFileDto,
    ): Promise<ProposalFile> {
        const { url, proposalId } = createProposalFileDto
        const createdProposalFile = await this.create({
            url,
            proposalId,
        })
        await createdProposalFile.save()
        return createdProposalFile
    }

    async updateProposalFile(
        proposalFileId: number,
        proposalFileDto: ProposalFileDto,
    ): Promise<ProposalFile> {
        await this.createQueryBuilder('proposal_files')
            .update(ProposalFile)
            .set({
                url: proposalFileDto.url,
            })
            .where('proposal_files.id = :proposalFileId', { proposalFileId })
            .execute()
        const proposalFile = await this.findOne({
            where: {
                id: proposalFileId,
            },
        })
        return proposalFile
    }

    async deleteProposalFile(proposalFileId: number): Promise<void> {
        await this.delete(proposalFileId)
    }

    async getInternalListProposalFileByProposalId(
        proposalId: number,
    ): Promise<ProposalFile[]> {
        const listProposalFiles = await this.find({
            where: {
                proposalId: proposalId,
            },
        })
        return listProposalFiles
    }
}
