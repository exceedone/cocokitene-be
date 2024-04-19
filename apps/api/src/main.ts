import { ApiModule } from '@api/modules/api.module'
import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory, Reflector } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { HttpExceptionFilter, messageLog } from '@shares/exception-filter'
import { JwtAuthGuard } from '@shares/guards/jwt-auth.guard'
import { ResponseTransformInterceptor } from '@shares/interceptors/response.interceptor'
import * as dns from 'dns'
import { S3 } from '@aws-sdk/client-s3'
import configuration from '@shares/config/configuration'

async function bootstrap() {
    try {
        const app = await NestFactory.create(ApiModule)
        const config = app.get<ConfigService>(ConfigService)
        const globalPrefix = config.get('api.prefix')

        app.enableCors()
        app.setGlobalPrefix(globalPrefix)
        // app.useGlobalInterceptors(new SentryInterceptor())
        app.useGlobalInterceptors(new ResponseTransformInterceptor())
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                transform: true,
            }),
        )
        app.useGlobalFilters(new HttpExceptionFilter())
        app.useGlobalGuards(new JwtAuthGuard(new Reflector()))
        // app.useGlobalGuards(new JwtAuthGuard())
        // app.useGlobalGuards(new RolesGuard(new Reflector()))
        const swaggerConfig = new DocumentBuilder()
            .setTitle('Cocokitene API docs')
            .setDescription('Cocokitene API description')
            .setVersion('1.0')
            .addBearerAuth()
            .build()
        const document = SwaggerModule.createDocument(app, swaggerConfig)
        SwaggerModule.setup('docs', app, document, {
            swaggerOptions: {
                tagsSorter: 'alpha',
                operationsSorter: 'alpha',
            },
        })
        const port = config.get('api.port')
        await app.listen(port)
        const logger = app.get<Logger>('winston')

        //Check connect internet
        const isConnected = !!(await dns.promises
            .resolve('google.com')
            .catch(() => {
                console.log('check error connect network!')
            }))
        if (isConnected) {
            // Connected to the internet
            Logger.log(`${messageLog.CONNECT_INTERNET_SUCCESS.message}`)
            logger.log('info', `${messageLog.CONNECT_INTERNET_SUCCESS.message}`)
        } else {
            // Not connected to the internet
            Logger.log(`${messageLog.CONNECT_INTERNET_FAILED.message}`)
            logger.log(
                'error',
                `${messageLog.CONNECT_INTERNET_FAILED.code} ${messageLog.CONNECT_INTERNET_FAILED.message}`,
            )
        }

        //Check connect S3
        const credentials = {
            accessKeyId: configuration().s3.accessKeyId,
            secretAccessKey: configuration().s3.secretAccessKey,
        }
        const region = configuration().s3.region
        const s3 = new S3({ credentials, region })

        try {
            const connectS3 = !!(await s3.headBucket({
                Bucket: configuration().s3.bucketName,
            }))
            if (connectS3) {
                //Connect to S3 successfully
                Logger.log(`${messageLog.CONNECT_S3_SUCCESS.message}`)
                logger.log('info', `${messageLog.CONNECT_S3_SUCCESS.message}`)
            } else {
                //Connect to S3 failed
                logger.log(
                    'error',
                    `${messageLog.CONNECT_S3_FAILED.code} ${messageLog.CONNECT_S3_FAILED.message}`,
                )
            }
        } catch (error) {
            Logger.log(`${messageLog.CONNECT_S3_FAILED.message}`)
            logger.log(
                'error',
                `${messageLog.CONNECT_S3_FAILED.code} ${messageLog.CONNECT_S3_FAILED.message}`,
            )
        }

        setTimeout(() => {
            logger.log('info', `${messageLog.TURN_ON_DAPP.message} ${port}`)
            Logger.log(`${messageLog.TURN_ON_DAPP.message}${port}`)
        }, 100)
        // logger.log(`${messageLog.TURN_ON_DAPP.message} ${port}`)
    } catch (err) {
        console.log('Error Check ', err)
    }
}

bootstrap()
