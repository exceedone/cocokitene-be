import { Plan } from '@entities/plan.entity'
import { PartialType } from '@nestjs/mapped-types'

export class InsertPlanDto extends PartialType(Plan) {
    planName: any
}
export const planData: InsertPlanDto[] = [
    {
        planName: '月払い',
        description: '毎月に支払い',
        maxStorage: 80,
        maxMeeting: 100,
        price: 1000,
        maxShareholderAccount: 300,
    },
    {
        planName: '試用',
        description:
            'こちらは試用版です、一ヶ月間が切れると自動的に無料版に切り替え',
        maxStorage: 40,
        maxMeeting: 30,
        price: 100,
        maxShareholderAccount: 100,
    },
    {
        planName: '無料版',
        description: '無料版です',
        maxStorage: 10,
        maxMeeting: 10,
        price: 0,
        maxShareholderAccount: 30,
    },
]
