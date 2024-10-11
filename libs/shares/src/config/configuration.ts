import * as dotenv from 'dotenv'
import { isBoolean } from 'class-validator'
import * as process from 'process'
dotenv.config()

interface Configuration {
    common: {
        nodeEnv: string
        networkEnv: string
    }
    database: {
        host: string
        port: number
        name: string
        user: string
        pass: string
        type: string
        logging: boolean
        synchronize: boolean
    }
    api: {
        port: number
        prefix: string
        accessJwtSecretKey: string
        refreshJwtSecretKey: string
        accessTokenExpireInSec: number
        refreshTokenExpireInSec: number
        secretSystemAdminPasswordKey: string
        secretUserPasswordKey: string
        systemAdminAccessJwtSecretKey: string
        systemAdminRefreshJwtSecretKey: string
        systemAdminAccessTokenExpireInSec: number
        systemAdminRefreshTokenExpireInSec: number
    }
    email: {
        host: string
        // port: number;
        secure: boolean
        auth: {
            user: string
            password: string
        }
        cc_emails: string
    }

    crawler: {
        adminAddress: string
        adminPrivateKey: string
    }
    s3: {
        accessKeyId: string
        secretAccessKey: string
        region: string
        bucketName: string
        expiresIn: number
    }
    transaction: {
        maximumNumberTransactionPerCallFuncBlockchain: number
    }
    cronjob: {
        cronJobHandleEndedMeeting: string
        cronJobHandlePendingTransaction: string
        cronJobCrawlMeetingEvent: string
        cronJobHandleDataAfterEventSuccessfulCreateMeeting: string
        cronJobHandleDataAfterEventSuccessfulUpdateProposalMeeting: string
    }
    fe: {
        port: number
        ipAddress: string
        baseFeUrl: string
        languageEn: string
        languageJa: string
    }
    phone: {
        numberPhone: string
    }
    log: {
        folderLog: string
    }
    chat: {
        sendChatPublic: string
        sendChatPrivate: string
        receiveChatPrivate: string
        receiveChatPublic: string
    }
    backup: {
        folderBackup: string
        cronJobHandleBackupBucketS3toLocal: string
    }
    service: {
        cronJobHandleApplyServiceApprovedBySys: string
        cronJobHandleReminderRenewalServicePlan: string
    }
}

export default (): Configuration => ({
    common: {
        nodeEnv: process.env.NODE_ENV || 'development',
        networkEnv: process.env.NETWORK_ENV || 'TESTNET',
    },
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 3307,
        name: process.env.DB_NAME || 'exment_market',
        user: process.env.DB_USER || 'root',
        pass: process.env.DB_PASS || '10703223',
        type: process.env.DB_TYPE || 'mysql',
        logging: process.env.DB_LOGGING === 'true',
        synchronize: process.env.DB_SYNC === 'true',
    },
    api: {
        port: parseInt(process.env.API_PORT, 10) || 4000,
        prefix: process.env.API_PREFIX || 'api',
        accessJwtSecretKey: process.env.ACCESS_JWT_SECRET_KEY || '',
        refreshJwtSecretKey: process.env.REFRESH_JWT_SECRET_KEY || '',
        accessTokenExpireInSec: parseInt(
            process.env.ACCESS_TOKEN_EXPIRE_IN_SEC,
            10,
        ),
        refreshTokenExpireInSec: parseInt(
            process.env.REFRESH_TOKEN_EXPIRE_IN_SEC,
            10,
        ),
        secretSystemAdminPasswordKey: process.env.PASSWORD_SECRET_KEY,
        secretUserPasswordKey: process.env.PASSWORD_SECRET_KEY_USER,
        systemAdminAccessJwtSecretKey:
            process.env.SYSTEM_ADMIN_ACCESS_JWT_SECRET_KEY || '',
        systemAdminRefreshJwtSecretKey:
            process.env.SYSTEM_ADMIN_REFRESH_JWT_SECRET_KEY || '',
        systemAdminAccessTokenExpireInSec: parseInt(
            process.env.SYSTEM_ADMIN_ACCESS_TOKEN_EXPIRE_IN_SEC,
            10,
        ),
        systemAdminRefreshTokenExpireInSec: parseInt(
            process.env.SYSTEM_ADMIN_REFRESH_TOKEN_EXPIRE_IN_SEC,
            10,
        ),
    },
    email: {
        host: process.env.EMAIL_HOST,
        // port: parseInt(process.env.EMAIL_PORT,10),
        secure: isBoolean(process.env.EMAIL_AUTH),
        auth: {
            user: process.env.EMAIL_USER,
            password: process.env.EMAIL_PASSWORD,
        },
        cc_emails: process.env.CC_EMAILS || '',
    },
    crawler: {
        adminAddress: process.env.ADMIN_ADDRESS || '',
        adminPrivateKey: process.env.ADMIN_PRIVATE_KEY || '',
    },
    s3: {
        accessKeyId: process.env.S3_ACCESS_KEY || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        region: process.env.S3_REGION || '',
        bucketName: process.env.S3_BUCKET_NAME || '',
        expiresIn: parseInt(process.env.S3_URL_EXPIRES_IN_SEC, 10) || 300,
    },
    transaction: {
        maximumNumberTransactionPerCallFuncBlockchain:
            parseInt(
                process.env.MAXIMUM_NUMBER_TRANSACTION_PER_CALL_FUNC_BLOCKCHAIN,
                10,
            ) || 100,
    },
    cronjob: {
        cronJobHandleEndedMeeting: process.env.CRON_JOB_HANDLE_ENDED_MEETING,
        cronJobCrawlMeetingEvent: process.env.CRON_JOB_CRAWL_MEETING_EVENT,
        cronJobHandlePendingTransaction:
            process.env.CRON_JOB_HANDLE_PENDING_TRANSACTION,
        cronJobHandleDataAfterEventSuccessfulCreateMeeting:
            process.env
                .CRON_JOB_HANDLE_DATA_AFTER_EVENT_SUCCESSFUL_CREATE_MEETING,
        cronJobHandleDataAfterEventSuccessfulUpdateProposalMeeting:
            process.env
                .CRON_JOB_HANDLE_DATA_AFTER_EVENT_SUCCESSFUL_UPDATE_PROPOSAL_MEETING,
    },
    fe: {
        port: parseInt(process.env.FE_PORT, 10) || 3000,
        ipAddress: process.env.IP_ADDRESS,
        baseFeUrl: process.env.BASE_FE_URL,
        languageEn: process.env.LANGUAGE_EN || 'en',
        languageJa: process.env.LANGUAGE_JA || 'ja',
    },
    phone: {
        numberPhone: process.env.NUMBER_PHONE,
    },
    log: {
        folderLog: process.env.FOLDER_LOG,
    },
    chat: {
        sendChatPublic: process.env.CHAT_PUBLIC,
        sendChatPrivate: process.env.CHAT_PRIVATE,
        receiveChatPrivate: process.env.RECEIVE_CHAT_PRIVATE,
        receiveChatPublic: process.env.RECEIVE_CHAT_PUBLIC,
    },
    backup: {
        folderBackup: process.env.FOLDER_BACKUP,
        cronJobHandleBackupBucketS3toLocal:
            process.env.CRON_JOB_HANDLE_BACK_UP_BUCKET_S3_TO_LOCAL,
    },
    service: {
        cronJobHandleApplyServiceApprovedBySys:
            process.env.CRON_JOB_HANDLE_APPLY_SERVICE_APPROVED_BY_SYS,
        cronJobHandleReminderRenewalServicePlan:
            process.env.CRON_JOB_HANDLE_REMINDER_RENEWAL_SERVICE_PLAN,
    },
})
