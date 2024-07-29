import { PartialType } from '@nestjs/mapped-types'
import { Emoji } from '@entities/reaction-icon.entity'
import { EmojiEnum } from '@shares/constants'

export class InsertEmojiDto extends PartialType(Emoji) {}

export const emojiData: InsertEmojiDto[] = [
    {
        key: EmojiEnum.THUMBSUP,
        description: 'thumbs up',
    },
    {
        key: EmojiEnum.SMILING,
        description: 'Smiling',
    },
    {
        key: EmojiEnum.HEART,
        description: 'heart',
    },
    {
        key: EmojiEnum.CLAP,
        description: 'Clapping',
    },
]
