import { Injectable, Logger } from '@nestjs/common'
import { electionData, InsertElectionDto } from '@seeds/election/data'
import { Election } from '@entities/election.entity'
import { ElectionRepository } from '@repositories/election.repository'

@Injectable()
export class ElectionSeederService {
    constructor(private readonly electionRepository: ElectionRepository) {}
    async saveOneElection(election: InsertElectionDto): Promise<Election> {
        const existedElection = await this.electionRepository.findOne({
            where: {
                status: election.status,
            },
        })

        if (existedElection) {
            Logger.error(
                `Duplicate status with name: ${existedElection.status} status already exists`,
            )
            return
        }

        const createdElection = await this.electionRepository.create(election)
        await createdElection.save()
        Logger.log(
            'election______inserted__election__id: ' + createdElection.id,
        )
        return createdElection
    }

    async seedElection() {
        const savePromises = electionData.map((election) =>
            this.saveOneElection(election),
        )

        Logger.debug('election______start__seeding__election')
        await Promise.all(savePromises)
        Logger.log('election______end__seeding__election')
    }
}
