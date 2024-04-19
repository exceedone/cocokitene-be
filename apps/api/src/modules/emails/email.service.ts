/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common'

import { UserRepository } from '@repositories/user.repository'
import { MailerService } from '@nestjs-modules/mailer'
import { MeetingRepository } from '@repositories/meeting.repository'
import { UserMeetingService } from '@api/modules/user-meetings/user-meeting.service'
import { SystemAdmin } from '@entities/system-admin.entity'
import configuration from '@shares/config/configuration'
import { baseUrlFe } from '@shares/utils'
import { Company } from '@entities/company.entity'
import { User } from '@entities/user.entity'
import { RegisterCompanyDto } from '@dtos/company.dto'
import { FileTypes, MeetingRole } from '@shares/constants/meeting.const'
import { MeetingFileService } from '@api/modules/meeting-files/meeting-file.service'
import { RoleMtgEnum } from '@shares/constants'
import { RoleMtgService } from '@api/modules/role-mtgs/role-mtg.service'

@Injectable()
export class EmailService {
    // private transporter
    constructor(
        private readonly mailerService: MailerService,
        private readonly userRepository: UserRepository,
        private readonly meetingRepository: MeetingRepository,
        private readonly userMeetingService: UserMeetingService,
        private readonly meetingFileService: MeetingFileService,
        private readonly roleMtgService: RoleMtgService,
    ) {}

    async sendEmailMeeting(meetingId: number, companyId: number) {
        const roleMtgShareholder =
            await this.roleMtgService.getRoleMtgByNameAndCompanyId(
                RoleMtgEnum.SHAREHOLDER,
                companyId,
            )
        const idsParticipantsInMeetings =
            await this.userMeetingService.getUserMeetingByMeetingIdAndRole(
                meetingId,
                roleMtgShareholder.id,
            )

        const participants = await Promise.all(
            idsParticipantsInMeetings.map(async (idsParticipantsInMeeting) => {
                const user = await this.userRepository.findOne({
                    where: {
                        id: idsParticipantsInMeeting.user.id,
                    },
                })
                return user
            }),
        )
        const meetingFiles =
            await this.meetingFileService.getMeetingFilesByMeetingIdAndType(
                meetingId,
                FileTypes.MEETING_INVITATION,
            )

        const meeting = await this.meetingRepository.findOne({
            where: {
                id: meetingId,
            },
        })
        const recipientEmails = participants.map(
            (participant) => participant.email,
        )
        const fePort = configuration().fe.port,
            ipAddress = configuration().fe.ipAddress,
            languageJa = configuration().fe.languageJa,
            baseUrl = baseUrlFe(fePort, ipAddress, languageJa),
            detailMeeting = baseUrl + `/meeting/detail/${meeting.id}`,
            numberPhoneService = configuration().phone.numberPhone

        await this.mailerService.sendMail({
            cc: recipientEmails,
            subject: '総会招待通知',
            template: './send-meeting-invite',
            context: {
                title: meeting.title,
                startTime: meeting.startTime,
                endTime: meeting.endTime,
                endVotingTime: meeting.endVotingTime,
                link: meeting.meetingLink,
                detailMeeting: detailMeeting,
                numberPhoneService: numberPhoneService,
                files: meetingFiles.map((item) => item.url),
            },
        })
    }

    async sendEmailConfirmResetPassword(systemAdmin: SystemAdmin) {
        const resetPasswordToken = systemAdmin.resetPasswordToken,
            emailSystemAdmin = systemAdmin.email,
            fePort = configuration().fe.port,
            ipAddress = configuration().fe.ipAddress,
            languageJa = configuration().fe.languageJa,
            baseUrl = baseUrlFe(fePort, ipAddress, languageJa)

        const resetLink = `${baseUrl}/reset-password?token=${resetPasswordToken}`
        if (!emailSystemAdmin) {
            console.log('koo co email')
            return
        }
        await this.mailerService.sendMail({
            to: emailSystemAdmin,
            subject: 'Forgotten Password',
            template: './send-reset-password',
            context: {
                email: emailSystemAdmin,
                username: systemAdmin.username,
                resetLink: resetLink,
            },
        })
    }

    async sendEmailWhenCreatedCompanySuccesfully(
        superAdmin: User,
        companyInformation: Company,
        defaultPasswordSuperAdmin: string,
    ) {
        const emailServer = configuration().email.auth.user,
            numberPhoneService = configuration().phone.numberPhone,
            fePort = configuration().fe.port,
            ipAddress = configuration().fe.ipAddress,
            languageJa = configuration().fe.languageJa,
            baseUrl = baseUrlFe(fePort, ipAddress, languageJa)
        await this.mailerService.sendMail({
            to: superAdmin.email,
            cc: emailServer,
            subject: '会社作成通知',
            template: './send-information-super-admin',
            context: {
                usernameSuperAdmin: superAdmin.username,
                emailSuperAdmin: superAdmin.email,
                numberPhoneService: numberPhoneService,
                passwordAdmin: defaultPasswordSuperAdmin,
                baseUrl: baseUrl,
                companyName: companyInformation.companyName,
                taxNumber: companyInformation.taxNumber,
            },
        })
    }

    async sendEmailWhenCreateUserSuccessfully(
        createdUser: User,
        password: string,
        emailSuperAdmin: string,
        taxNumber: string,
    ) {
        const { email, username, shareQuantity, walletAddress, phone } =
            createdUser

        const emailServer = configuration().email.auth.user,
            fePort = configuration().fe.port,
            ipAddress = configuration().fe.ipAddress,
            languageJa = configuration().fe.languageJa,
            baseUrl = baseUrlFe(fePort, ipAddress, languageJa),
            numberPhoneService = configuration().phone.numberPhone

        await this.mailerService.sendMail({
            to: email,
            cc: [emailSuperAdmin, emailServer],
            subject: 'ユーザーアカウント作成通知',
            template: './send-information-create-user-side-user',
            context: {
                username: username,
                email: email,
                password: password,
                baseUrl: baseUrl,
                numberPhoneService: numberPhoneService,
                taxNumber: taxNumber,
            },
        })
    }
    async sendEmailRegisterCompany(registerCompanyDto: RegisterCompanyDto) {
        const cc_emails = configuration().email.cc_emails,
            emailServer = configuration().email.auth.user
        cc_emails.push(emailServer)
        const numberPhoneService = configuration().phone.numberPhone
        const { note, company, phone, username, email } = registerCompanyDto
        await this.mailerService.sendMail({
            to: email,
            cc: cc_emails,
            subject: 'サービス登録',
            template: './register-info-company-from-user-landing-page',
            context: {
                username: username,
                companyName: company,
                phone: phone,
                email: email,
                note: note,
                numberPhoneService: numberPhoneService,
            },
        })
    }

    async sendEmailConfirmResetPasswordUser(user: User) {
        const resetPasswordToken = user.resetPasswordToken,
            emailUser = user.email,
            fePort = configuration().fe.port,
            ipAddress = configuration().fe.ipAddress,
            languageJa = configuration().fe.languageJa,
            baseUrl = baseUrlFe(fePort, ipAddress, languageJa)

        const resetLink = `${baseUrl}/reset-password-user?token=${resetPasswordToken}`
        if (!emailUser) {
            console.log('koo co email')
            return
        }
        await this.mailerService.sendMail({
            to: emailUser,
            subject: 'Forgotten Password',
            template: './send-reset-password',
            context: {
                email: emailUser,
                username: user.username,
                resetLink: resetLink,
            },
        })
    }
}
