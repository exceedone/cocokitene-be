import { GetPresignedUrlDto } from '@dtos/s3.dto'
import { Injectable } from '@nestjs/common'
import {
    PutObjectCommand,
    PutObjectCommandInput,
    S3Client,
} from '@aws-sdk/client-s3'
import configuration from '@shares/config/configuration'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

@Injectable()
export class S3Service {
    private client: S3Client
    private bucketName: string
    private expiresIn: number

    constructor() {
        const credentials = {
            accessKeyId: configuration().s3.accessKeyId,
            secretAccessKey: configuration().s3.secretAccessKey,
        }

        const region = configuration().s3.region

        this.client = new S3Client({ credentials, region })
        this.bucketName = configuration().s3.bucketName
        this.expiresIn = configuration().s3.expiresIn
    }

    async getPresignedUrls(getPresignedUrlDto: GetPresignedUrlDto): Promise<{
        uploadUrls: string[]
    }> {
        const { meetingFiles } = getPresignedUrlDto

        const presignedUrlPromises = []

        for (const { fileName, fileType } of meetingFiles) {
            const bucketParam = {
                Bucket: this.bucketName,
                Key: fileType + '/' + Date.now() + '/' + fileName,
            }
            presignedUrlPromises.push(this.getPresignedUrl(bucketParam))
        }

        const presignedUrls = await Promise.all(presignedUrlPromises)

        return {
            uploadUrls: presignedUrls,
        }
    }

    async getPresignedUrl(bucketParam: PutObjectCommandInput): Promise<string> {
        const command = new PutObjectCommand(bucketParam)
        const presignedUrl = await getSignedUrl(this.client, command, {
            expiresIn: this.expiresIn,
        })
        return presignedUrl
    }
}
