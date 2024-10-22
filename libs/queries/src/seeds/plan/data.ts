import { Plan } from '@entities/plan.entity'
import { PartialType } from '@nestjs/mapped-types'

export class InsertPlanDto extends PartialType(Plan) {
    planName: any
}
export const planData: InsertPlanDto[] = [
    {
        planName: '試用',
        description: '1カ月で試用する',
        maxStorage: 1,
        maxMeeting: 10,
        price: 0,
        maxShareholderAccount: 30,
    },
    {
        planName: '中',
        description: '中',
        maxStorage: 5,
        maxMeeting: 50,
        price: 5000,
        maxShareholderAccount: 100,
    },
    {
        planName: '高',
        description: '高',
        maxStorage: 10,
        maxMeeting: 100,
        price: 10000,
        maxShareholderAccount: 300,
    },
]
