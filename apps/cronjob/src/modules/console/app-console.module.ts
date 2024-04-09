import { Module } from '@nestjs/common'
import { DatabaseModule } from '@database/database.module'
import { ConfigModule } from '@nestjs/config'
import configuration from '@shares/config/configuration'
import { TransactionModule } from '../transactions/transaction.module'
import { CronjobModule } from '../cronjob/cronjob.module'
import { ConsoleModule } from 'nestjs-console'

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
        }),
        DatabaseModule,
        TransactionModule,
        CronjobModule,
        ConsoleModule,
    ],
})
export class AppConsoleModule {}
