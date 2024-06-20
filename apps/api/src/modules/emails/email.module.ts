import { Module, forwardRef } from '@nestjs/common'
import { EmailService } from '@api/modules/emails/email.service'
import { MailerModule } from '@nestjs-modules/mailer'
import { ConfigService } from '@nestjs/config'
import { join } from 'path'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { UserMeetingModule } from '@api/modules/user-meetings/user-meeting.module'
import { UserStatusModule } from '@api/modules/user-status/user-status.module'
import { CompanyStatusModule } from '@api/modules/company-status/company-status.module'
import { UserRoleModule } from '@api/modules/user-roles/user-role.module'
import { SystemAdminModule } from '@api/modules/system-admin/system-admin.module'
import { ShareholderModule } from '@api/modules/shareholder/shareholder.module'
import { MeetingFileModule } from '@api/modules/meeting-files/meeting-file.module'
import { RoleMtgModule } from '@api/modules/role-mtgs/role-mtg.module'
import { MeetingRoleMtgModule } from '../meeting-role-mtgs/meeting-role-mtg.module'
import { UserModule } from '../users/user.module'

@Module({
    imports: [
        MailerModule.forRootAsync({
            useFactory: async (configService: ConfigService) => ({
                transport: {
                    host: configService.get('email.host'),
                    port: configService.get('email.port'),
                    secure: configService.get('email.secure'),
                    auth: {
                        user: configService.get('email.auth.user'),
                        pass: configService.get('email.auth.password'),
                    },
                },
                defaults: {
                    from: configService.get('email.auth.user'),
                },
                template: {
                    dir: join(__dirname, 'modules/emails/templates'),
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true,
                    },
                },
            }),
            inject: [ConfigService],
        }),
        UserMeetingModule,
        UserStatusModule,
        CompanyStatusModule,
        UserRoleModule,
        SystemAdminModule,
        ShareholderModule,
        MeetingFileModule,
        RoleMtgModule,
        MeetingRoleMtgModule,
        forwardRef(() => UserModule),
    ],

    providers: [EmailService],
    exports: [EmailService],
})
export class EmailModule {}
