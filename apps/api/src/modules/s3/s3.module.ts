import { S3Controller } from '@api/modules/s3/s3.controller'
import { S3Service } from '@api/modules/s3/s3.service'
import { Module } from '@nestjs/common'

@Module({
    controllers: [S3Controller],
    providers: [S3Service],
})
export class S3Module {}
