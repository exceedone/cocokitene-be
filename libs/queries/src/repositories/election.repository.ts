import { Repository } from 'typeorm'
import { Election } from '@entities/election.entity'
import { CustomRepository } from '@shares/decorators'
import { GetAllElectionStatusDto } from '@dtos/election.dto'
import { Pagination, paginate } from 'nestjs-typeorm-paginate'
@CustomRepository(Election)
export class ElectionRepository extends Repository<Election> {
    async getAllElectionStatus(
        options: GetAllElectionStatusDto,
    ): Promise<Pagination<Election>> {
        const { page, limit, searchQuery } = options
        const queryBuilder = this.createQueryBuilder('elections').select([
            'elections.id',
            'elections.status',
            'elections.description',
        ])
        if (searchQuery) {
            queryBuilder.andWhere('elections.status like :searchQuery', {
                searchQuery: `%${searchQuery}%`,
            })
        }
        return paginate(queryBuilder, { page, limit })
    }

    async getElectionStatusById(electionStatusId: number): Promise<Election> {
        const electionStatus = await this.findOne({
            where: {
                id: electionStatusId,
            },
        })
        return electionStatus
    }
}
