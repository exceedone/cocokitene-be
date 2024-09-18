import {
    CreatePersonnelVotingDto,
    PersonnelVotingDtoUpdate,
} from '@dtos/personnel-voting.dto'
import { PersonnelVoting } from '@entities/personnel-voting.entity'
import { CustomRepository } from '@shares/decorators'
import { Repository } from 'typeorm'

@CustomRepository(PersonnelVoting)
export class PersonnelVotingRepository extends Repository<PersonnelVoting> {
    async createPersonnelVoting(
        createPersonnelVotingDto: CreatePersonnelVotingDto,
    ): Promise<PersonnelVoting> {
        const { title, type, meetingId, creatorId } = createPersonnelVotingDto

        const createdPersonnelVoting = await this.create({
            title,
            type,
            meetingId,
            creatorId,
        })

        return await createdPersonnelVoting.save()
    }

    async getPersonnelVotingById(
        personnelVotingId: number,
    ): Promise<PersonnelVoting> {
        // const personnelVoting = await this.findOne({
        //     where: {
        //         id: personnelVotingId,
        //     },
        // })
        // return personnelVoting

        const personnelVoting = await this.createQueryBuilder(
            'personnel_voting',
        )
            .select()
            .where('personnel_voting.id = :personnelVotingId', {
                personnelVotingId: personnelVotingId,
            })
            .leftJoinAndSelect('personnel_voting.candidate', 'candidate')
            .getOne()

        return personnelVoting
    }

    async updatePersonnelVoting(
        personnelVotingId: number,
        personnelUpdateDto: PersonnelVotingDtoUpdate,
    ): Promise<PersonnelVoting> {
        const { title, type, meetingId } = personnelUpdateDto

        await this.createQueryBuilder('personnel_voting')
            .update(PersonnelVoting)
            .set({
                title: title,
                type: type,
                meetingId: meetingId,
            })
            .where('personnel_voting.id = :personnelVotingId', {
                personnelVotingId: personnelVotingId,
            })
            .execute()
        const personnelVoting = await this.getPersonnelVotingById(
            personnelVotingId,
        )

        return personnelVoting
    }

    async getAllPersonnelVotingByMtgId(
        meetingId: number,
    ): Promise<PersonnelVoting[]> {
        const personnelVoting = await this.createQueryBuilder(
            'personnel_voting',
        )
            .select([
                'personnel_voting.id',
                'personnel_voting.title',
                'personnel_voting.type',
                'personnel_voting.meetingId',
                'personnel_voting.typeElection',
                'personnel_voting.creatorId',
                'personnel_voting.createdAt',
                'personnel_voting.deletedAt',
            ])
            .where('personnel_voting.meetingId = :meetingId', {
                meetingId: meetingId,
            })
            .leftJoin('personnel_voting.candidate', 'candidates')
            .addSelect([
                'candidates.id',
                'candidates.candidateName',
                'candidates.personnelVotingId',
                'candidates.votedQuantity',
                'candidates.unVotedQuantity',
                'candidates.notVoteYetQuantity',
                'candidates.unVotedQuantity',
                'candidates.createdAt',
                'candidates.deletedAt',
            ])
            .getMany()

        return personnelVoting
    }
}
