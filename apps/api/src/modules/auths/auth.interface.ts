import { User } from '@entities/user.entity'
import { SystemAdmin } from '@entities/system-admin.entity'

export interface LoginResponseData {
    accessToken: string
    refreshToken: string
    userData: User
}

export interface SystemAdminLoginResponseData {
    accessToken: string
    refreshToken: string
    systemAdminData: SystemAdmin
}

export interface GenerateAccessJWTData {
    accessToken: string
}

export interface GenerateAccessJWTSystemAdminData {
    systemAdminAccessToken: string
}
