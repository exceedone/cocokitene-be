import { Injectable, Logger } from '@nestjs/common'
import { ReactionIconRepository } from '@repositories/reaction-icon.repository'
import { emojiData, InsertEmojiDto } from '@seeds/reaction-icon/data'
import { Emoji } from '@entities/reaction-icon.entity'

@Injectable()
export class ReactionIconSeederService {
    constructor(private readonly emojiRepository: ReactionIconRepository) {}

    async saveOneEmoji(emoji: InsertEmojiDto): Promise<Emoji> {
        const existedEmoji = await this.emojiRepository.findOne({
            where: {
                key: emoji.key,
            },
        })
        if (existedEmoji) {
            Logger.error(
                `Duplicate key with name: ${existedEmoji.key} already exists`,
            )
            return
        }

        const createdEmoji = await this.emojiRepository.create(emoji)
        await createdEmoji.save()
        Logger.log('emoji______inserted__emoji__id: ' + createdEmoji.id)
        return createdEmoji
    }

    async seedEmoji() {
        const savePromises = emojiData.map((emoji) => this.saveOneEmoji(emoji))

        Logger.debug('emoji______start__seeding__emoji')
        await Promise.all(savePromises)
        Logger.log('emoji______end__seeding__emoji')
    }
}
