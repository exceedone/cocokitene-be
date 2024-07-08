import { Repository } from 'typeorm'
import { Proposal } from '@entities/proposal.entity'
import { CustomRepository } from '@shares/decorators'
import {
    CreateProposalDto,
    GetAllProposalDto,
    ProposalDtoUpdate,
} from '@dtos/proposal.dto'
import {
    IPaginationOptions,
    paginateRaw,
    Pagination,
} from 'nestjs-typeorm-paginate'

@CustomRepository(Proposal)
export class ProposalRepository extends Repository<Proposal> {
    async createProposal(
        createProposalDto: CreateProposalDto,
    ): Promise<Proposal> {
        const {
            title,
            description,
            oldDescription,
            type,
            meetingId,
            creatorId,
            notVoteYetQuantity,
        } = createProposalDto
        const createdProposal = await this.create({
            title,
            description,
            oldDescription,
            type,
            meetingId,
            creatorId,
            notVoteYetQuantity,
        })
        return await createdProposal.save()
    }

    async getProposalByProposalId(proposalId: number) {
        const proposal = await this.findOne({
            where: {
                id: proposalId,
            },
        })
        return proposal
    }

    async getInternalProposalById(id: number): Promise<Proposal> {
        const proposal = await this.createQueryBuilder('proposals')
            .select()
            .where('proposals.id = :id', {
                id,
            })
            .leftJoinAndSelect('proposals.proposalFiles', 'proposalFiles')
            .getOne()

        return proposal
    }

    async updateProposal(
        proposalId: number,
        proposalDtoUpdate: ProposalDtoUpdate,
    ): Promise<Proposal> {
        const {
            title,
            description,
            oldDescription,
            notVoteYetQuantity,
            votedQuantity,
            unVotedQuantity,
        } = proposalDtoUpdate
        await this.createQueryBuilder('proposals')
            .update(Proposal)
            .set({
                title: title,
                description: description,
                oldDescription: oldDescription,
                unVotedQuantity: unVotedQuantity,
                votedQuantity: votedQuantity,
                notVoteYetQuantity: notVoteYetQuantity,
                // creatorId: userId,
            })
            .where('proposals.id = :proposalId', { proposalId })
            .execute()
        const proposal = await this.getProposalByProposalId(proposalId)
        return proposal
    }

    async getProposalById(proposalId: number): Promise<Proposal> {
        const proposal = await this.findOne({
            where: {
                id: proposalId,
            },
            relations: ['meeting'],
        })
        return proposal
    }

    async getAllProposals(
        meetingId: number,
        userId: number,
        options: IPaginationOptions & GetAllProposalDto,
    ): Promise<Pagination<Proposal>> {
        const typeQuery = options.type
        const queryBuilder = this.createQueryBuilder('proposals')
            .select([
                'proposals.id',
                'proposals.title',
                'proposals.description',
                'proposals.type',
                'proposals.votedQuantity',
                'proposals.unVotedQuantity',
                'proposals.notVoteYetQuantity',
            ])
            .leftJoin(
                'votings',
                'voting',
                'proposals.id = voting.proposalId AND voting.userId = :userId',
                { userId },
            )
            .addSelect(
                `(
            CASE
                WHEN voting.result = 'vote' THEN 1
                WHEN voting.result = 'un_vote' THEN 2
                WHEN voting.result = 'no_idea' THEN 3
                ELSE 4
        
          END)`,
                'resultActionVote',
            )

            .where('proposals.type = :type', {
                type: typeQuery,
            })
            .andWhere('proposals.meetingId = :meetingId', {
                meetingId: meetingId,
            })
        return paginateRaw(queryBuilder, options)
    }
    async getInternalListProposalByMeetingId(
        meetingId: number,
    ): Promise<Proposal[]> {
        const listProposals = await this.find({
            where: {
                meetingId: meetingId,
            },
        })
        return listProposals
    }

    async getAllProposalByMtgId(meetingId: number): Promise<Proposal[]> {
        const proposal = await this.createQueryBuilder('proposals')
            .select()
            .where('proposals.meetingId = :meetingId', {
                meetingId,
            })
            .leftJoin('proposals.proposalFiles', 'proposalFiles')
            .addSelect([
                'proposalFiles.id',
                'proposalFiles.url',
                'proposalFiles.proposalId',
                'proposalFiles.deletedAt',
                'proposalFiles.createdAt',
            ])
            .getMany()

        return proposal
    }
}
