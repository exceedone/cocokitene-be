import { PartialType } from '@nestjs/mapped-types'
import { Emoji } from '@entities/reaction-icon.entity'
import { EmojiEnum } from '@shares/constants'

export class InsertEmojiDto extends PartialType(Emoji) {}

export const emojiData: InsertEmojiDto[] = [
    {
        key: EmojiEnum.INNOCENT,
        description: 'smile',
    },
    {
        key: EmojiEnum.THUMBSUP,
        description: 'thumbs up',
    },
    {
        key: EmojiEnum.RAGE,
        description: 'rage',
    },
    {
        key: EmojiEnum.SOB,
        description: 'sob',
    },
    {
        key: EmojiEnum.HEART,
        description: 'heart',
    },
]
