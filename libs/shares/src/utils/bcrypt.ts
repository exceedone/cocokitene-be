import * as bcrypt from 'bcrypt'
import configuration from '@shares/config/configuration'

export const hashPassword = async (plainPassword: string) => {
    return await bcrypt.hash(
        plainPassword + configuration().api.secretSystemAdminPasswordKey,
        10,
    )
}

export const comparePassword = async (
    plainPassword,
    encryptedPassword,
): Promise<boolean> => {
    return await bcrypt.compare(
        plainPassword + configuration().api.secretSystemAdminPasswordKey,
        encryptedPassword,
    )
}

export const hashPasswordUser = async (plainPassword: string) => {
    return await bcrypt.hash(
        plainPassword + configuration().api.secretUserPasswordKey,
        10,
    )
}

export const comparePasswordUser = async (
    plainPassword,
    encryptedPassword,
): Promise<boolean> => {
    return await bcrypt.compare(
        plainPassword + configuration().api.secretUserPasswordKey,
        encryptedPassword,
    )
}

export const createRandomPassword = (length: number): string => {
    const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * characters.length),
        )
    }
    return result
}
