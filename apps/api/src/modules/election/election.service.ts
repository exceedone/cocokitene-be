import { Election } from '@entities/election.entity'
import { GetAllElectionStatusDto } from './../../../../../libs/queries/src/dtos/election.dto'
import { Injectable } from '@nestjs/common'
import { ElectionRepository } from '@repositories/election.repository'
import { Pagination } from 'nestjs-typeorm-paginate'

@Injectable()
export class ElectionService {
    constructor(private readonly electionRepository: ElectionRepository) {}
    async getAllElectionStatus(
        getAllElectionStatusDto: GetAllElectionStatusDto,
    ): Promise<Pagination<Election>> {
        const electionStatus =
            await this.electionRepository.getAllElectionStatus(
                getAllElectionStatusDto,
            )
        return electionStatus
    }

    async getElectionStatusById(electionStatusId: number): Promise<Election> {
        return await this.electionRepository.getElectionStatusById(
            electionStatusId,
        )
    }
}
