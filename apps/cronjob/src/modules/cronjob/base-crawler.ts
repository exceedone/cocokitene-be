import { BlockService } from '../block/block.service'

import {
    MAX_BLOCK_RANGE,
    SLEEP_TIME_CRAWLER_IN_MINI_SECONDS,
} from './cronjob.const'
import { ConfigCrawler } from './cronjob.interface'
import { getContract, getWeb3Instance, timeOut } from '@shares/utils'
export abstract class BaseCrawler {
    private isCrawlingFlag = false
    constructor(protected blockService: BlockService) {}

    async crawlerBlock(
        fromBlock: number,
        toBlock: number,
        setup: ConfigCrawler,
    ) {
        const { abi, contract, provider, chainId } = setup
        const contractInstance = await getContract(abi, contract, provider)

        console.log('====================================')
        console.log(`ChainId: ${chainId}`)
        console.log(`Cronjob contract address:  ${contractInstance}`)
        console.log('from: ', fromBlock, 'to: ', toBlock)
        console.log('====================================')

        const events = await contractInstance.getPastEvents('allEvents', {
            fromBlock,
            toBlock,
        })
        for (const event in events) {
            const eventElement = events[event]
            console.log('Event: ' + eventElement['event'])
            await this.handleEvent(eventElement)
        }
        await this.blockService.upsertBlock(contract, chainId, toBlock)
    }

    async getLatesCrawledBlockNumber(setup: ConfigCrawler): Promise<number> {
        const { contract, chainId, startBlock } = setup
        const block = await this.blockService.getLastestBlock(contract, chainId)
        return block?.number > 0 ? block.number + 1 : startBlock
    }

    async scan(setup: ConfigCrawler): Promise<void> {
        const lastestCrawledBlockNumber = await this.getLatesCrawledBlockNumber(
            setup,
        )
        const { provider } = setup
        const web3Instance = getWeb3Instance(provider)

        let startBlockCrawler = lastestCrawledBlockNumber
        await timeOut(async () => {
            try {
                if (this.isCrawlingFlag) return
                this.isCrawlingFlag = true
                let latestBlock: number
                latestBlock = await web3Instance.eth.getBlockNumber()
                if (!latestBlock) return
                latestBlock = Math.min(
                    latestBlock - 1,
                    startBlockCrawler + MAX_BLOCK_RANGE,
                )
                if (latestBlock > startBlockCrawler) {
                    await this.crawlerBlock(
                        startBlockCrawler,
                        latestBlock,
                        setup,
                    )
                    startBlockCrawler = latestBlock + 1
                }
                this.isCrawlingFlag = false
            } catch (error) {
                this.isCrawlingFlag = false
                throw new Error(error)
            }
        }, SLEEP_TIME_CRAWLER_IN_MINI_SECONDS)
    }

    abstract handleEvent(event: any, setup?: ConfigCrawler): Promise<void>
}
