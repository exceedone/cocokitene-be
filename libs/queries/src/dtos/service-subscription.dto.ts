import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator'
import { GetAllDto } from './base.dto'
import {
    PaymentMethod,
    Sort_By_Order,
    StatusSubscription,
    SubscriptionEnum,
} from '@shares/constants'
import { ApiProperty } from '@nestjs/swagger'

export class GetAllServiceSubscription extends GetAllDto {
    @IsOptional()
    @IsEnum(Sort_By_Order)
    @ApiProperty({
        required: false,
        example: Sort_By_Order.ASC,
        default: Sort_By_Order.ASC,
        enum: Sort_By_Order,
    })
    sortOrder?: Sort_By_Order
}

export class CreateServiceSubscriptionDto {
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        example: 1,
        required: true,
    })
    companyId: number

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        example: 1,
        required: true,
    })
    planId: number

    @IsString()
    @IsOptional()
    @ApiProperty({
        required: false,
        example: 'Note note',
    })
    note: string

    @IsEnum(SubscriptionEnum)
    @ApiProperty({
        required: true,
        enum: SubscriptionEnum,
    })
    type: SubscriptionEnum

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        required: true,
        example: 100,
    })
    amount: number

    @IsNotEmpty()
    @IsEnum(PaymentMethod)
    @ApiProperty({
        required: true,
        enum: PaymentMethod,
    })
    paymentMethod: PaymentMethod

    @IsOptional()
    @IsString()
    @ApiProperty({
        required: false,
        example: '2023-12-20',
    })
    activationDate: string

    @IsOptional()
    @IsString()
    @ApiProperty({
        required: false,
        example: '2023-12-20',
    })
    expirationDate: string

    @IsNotEmpty()
    @IsEnum(StatusSubscription)
    @ApiProperty({
        required: true,
        enum: StatusSubscription,
    })
    status: StatusSubscription

    // @IsOptional()
    // @IsString()
    // @ApiProperty({
    //     required: false,
    //     example: 'https://www.africau.edu/images/default/sample.pdf',
    // })
    // transferReceipt: string
}

export class UpdateStatusServiceSubscriptionDto {
    @IsNotEmpty()
    @IsEnum(StatusSubscription)
    @ApiProperty({
        required: true,
        enum: StatusSubscription,
    })
    status: StatusSubscription
}

export class SubscriptionServiceDto {
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        example: 1,
        required: true,
    })
    companyId: number

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        example: 1,
        required: true,
    })
    planId: number

    @IsString()
    @IsOptional()
    @ApiProperty({
        required: false,
        example: 'Note note',
    })
    note: string

    @IsEnum(SubscriptionEnum)
    @ApiProperty({
        required: true,
        enum: SubscriptionEnum,
    })
    type: SubscriptionEnum

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        required: true,
        example: 100,
    })
    amount: number

    @IsNotEmpty()
    @IsEnum(PaymentMethod)
    @ApiProperty({
        required: true,
        enum: PaymentMethod,
    })
    paymentMethod: PaymentMethod

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        required: true,
        example: '2023-12-20',
    })
    activationDate: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        required: true,
        example: '2024-12-20',
    })
    expirationDate: string

    // @IsOptional()
    // @IsString()
    // @ApiProperty({
    //     required: false,
    //     example: 'https://www.africau.edu/images/default/sample.pdf',
    // })
    // transferReceipt: string
}

export class UpdateServiceSubscriptionDto extends SubscriptionServiceDto {
    @IsNotEmpty()
    @IsEnum(StatusSubscription)
    @ApiProperty({
        required: true,
        enum: StatusSubscription,
    })
    status: StatusSubscription
}
