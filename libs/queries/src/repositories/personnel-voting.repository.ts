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
}
