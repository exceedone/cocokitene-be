import { Repository } from 'typeorm'
import { CustomRepository } from '@shares/decorators'
import { Block } from '@entities/block.entity'

@CustomRepository(Block)
export class BlockRepository extends Repository<Block> {}
