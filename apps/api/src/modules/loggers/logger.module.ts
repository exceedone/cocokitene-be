import { Module } from '@nestjs/common'
import { WinstonModule } from 'nest-winston'
import { ConfigModule, ConfigService } from '@nestjs/config'
import * as winston from 'winston'
import { MyLoggerService } from '@api/modules/loggers/logger.service'
import * as moment from 'moment'
import 'winston-daily-rotate-file'

@Module({
    imports: [
        WinstonModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                const folderName = configService.get('log.folderLog')
                // get currentDate
                const customFormat = winston.format.printf(
                    ({ level, message, timestamp }) => {
                        const formattedTimestamp = moment(timestamp).format(
                            'YYYY-MM-DD HH:mm:ss',
                        )

                        return `${formattedTimestamp} ${level.toUpperCase()} ${message}`
                    },
                )

                const transport = new winston.transports.DailyRotateFile({
                    // dirname: `${folderName}/` + getDirName() + '/',
                    dirname: `${folderName}/`,
                    filename: 'cocokitene-%DATE%.log',
                    datePattern: 'YYYY-MM-DD', // rotates every day
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.json(),
                        customFormat,
                    ),
                    options: { flags: 'a' },
                })

                return winston.createLogger({
                    transports: [transport],
                })
            },
            inject: [ConfigService],
        }),
    ],
    providers: [MyLoggerService],
    exports: [MyLoggerService],
})
export class MyLoggerModule {}
