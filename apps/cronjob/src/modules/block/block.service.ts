import { Injectable } from '@nestjs/common'
import { SupportedChainId } from '@shares/constants'
import { BlockRepository } from '@repositories/block.repository'
import { Block } from '@entities/block.entity'

@Injectable()
export class BlockService {
    constructor(private readonly blockRepository: BlockRepository) {}

    async upsertBlock(
        contract: string,
        chainId: SupportedChainId,
        blockNumber: number,
    ): Promise<void> {
        const block = await this.blockRepository.findOne({
            where: {
                contract: contract,
                chainId: chainId,
            },
        })
        if (block) {
            block.number = blockNumber
            await block.save()
        } else {
            await this.blockRepository.insert({
                chainId: chainId,
                number: blockNumber,
                contract: contract,
            })
        }
    }

    async getLastestBlock(
        contract: string,
        chainId: SupportedChainId,
    ): Promise<Block> {
        const block = await this.blockRepository.findOne({
            where: {
                contract: contract,
                chainId: chainId,
            },
        })
        return block
    }
}
