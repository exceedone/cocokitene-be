import { GetPresignedUrlDto } from '@dtos/s3.dto'
import { Injectable } from '@nestjs/common'
import {
    PutObjectCommand,
    PutObjectCommandInput,
    S3Client,
    ListObjectsV2Command,
    GetObjectCommand,
} from '@aws-sdk/client-s3'
import configuration from '@shares/config/configuration'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import * as fs from 'fs'
import { createWriteStream } from 'fs'
import { join } from 'path'
import { Readable } from 'stream'

@Injectable()
export class S3Service {
    private client: S3Client
    private bucketName: string
    private expiresIn: number
    private folderBackup: string

    constructor() {
        const credentials = {
            accessKeyId: configuration().s3.accessKeyId,
            secretAccessKey: configuration().s3.secretAccessKey,
        }

        const region = configuration().s3.region

        this.client = new S3Client({ credentials, region })
        this.bucketName = configuration().s3.bucketName
        this.expiresIn = configuration().s3.expiresIn
        this.folderBackup = configuration().backup.folderBackup
    }

    async getPresignedUrls(
        getPresignedUrlDto: GetPresignedUrlDto,
        companyCode: string,
    ): Promise<{
        uploadUrls: string[]
    }> {
        const { meetingFiles } = getPresignedUrlDto

        const presignedUrlPromises = []

        for (const {
            fileName,
            fileType,
            folderType,
            subFolder,
        } of meetingFiles) {
            const bucketParam = {
                Bucket: this.bucketName,
                Key:
                    companyCode +
                    '/' +
                    folderType +
                    '/' +
                    subFolder +
                    // '/' +
                    fileType +
                    '/' +
                    Date.now() +
                    '/' +
                    fileName,
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

    //Backup Bucket S3 to local
    async backupBucketToLocal() {
        const localFolderBackup = this.folderBackup
        const date = new Date()
        const folderName = `${date.getFullYear()}${
            date.getMonth() + 1
        }${date.getDate()}`

        const folderPath = join(localFolderBackup, folderName, this.bucketName)

        //Create localFolder
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true })
            // console.log('create folder success!!!')
        } else {
            // console.log('folder is existed!!!!')
        }

        try {
            const listObjectsCommand = new ListObjectsV2Command({
                Bucket: this.bucketName,
            })
            const response = await this.client.send(listObjectsCommand)
            if (response.Contents) {
                for (const object of response.Contents) {
                    const key = object.Key
                    if (key) {
                        //Download Object in Bucket
                        await this.downloadObjectInBucket(
                            this.bucketName,
                            folderPath,
                            key,
                        )
                    }
                }
            }
        } catch (error) {
            console.log(
                'Error when backing up S3 Bucket to local folder!!!',
                error,
            )
        }
    }

    async downloadObjectInBucket(
        bucketName: string,
        localFolderPath: string,
        key: string,
    ): Promise<void> {
        // Create sub folder
        const filePath = join(localFolderPath, key)
        // console.log('filePath:' , filePath)

        const indexCutFilePath =
            filePath.lastIndexOf('/') > filePath.lastIndexOf('\\')
                ? filePath.lastIndexOf('/')
                : filePath.lastIndexOf('\\')
        // console.log('indexCutFilePath: ',indexCutFilePath)

        const dirName = filePath.substring(0, indexCutFilePath)
        // console.log('dirName: ',dirName)
        if (!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName, { recursive: true })
        }
        const getObjectCommand = new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
        })
        const response = (await this.client.send(getObjectCommand))
            .Body as Readable

        if (!key.endsWith('/')) {
            //Save object from bucket S3 into local
            const fileStream = createWriteStream(filePath)
            response.pipe(fileStream)

            return new Promise((resolve, reject) => {
                fileStream.on('close', resolve)
                fileStream.on('error', reject)
            })
        }
    }
}
