import configuration from '@shares/config/configuration'
import * as crypto from 'crypto'
import * as jwt from 'jsonwebtoken'
export const generateCryptoToken = (): string => {
    const resetToken = crypto.randomBytes(20).toString('hex')
    return crypto.createHash('sha256').update(resetToken).digest('hex')
}

export const generateAccessJWT = (data, options = {}) => {
    const key = configuration().api.accessJwtSecretKey
    return jwt.sign(data, key, options)
}
export const verifyAccessTokenJWT = async (token, options = {}) => {
    const key = configuration().api.accessJwtSecretKey
    return await jwt.verify(token, key, options)
}

export const verifyRefreshJWT = async (token, options = {}) => {
    const key = configuration().api.refreshJwtSecretKey
    return await jwt.verify(token, key, options)
}
export const generateRefreshTokenJWT = (data, options = {}) => {
    const key = configuration().api.refreshJwtSecretKey
    return jwt.sign(data, key, options)
}

export const generateSystemAdminAccessJWT = (data, options = {}) => {
    const systemAdminKey = configuration().api.systemAdminAccessJwtSecretKey
    return jwt.sign(data, systemAdminKey, options)
}

export const verifySystemAdminAccessTokenJWT = async (token, options = {}) => {
    const systemAdminKey = configuration().api.systemAdminAccessJwtSecretKey
    return await jwt.verify(token, systemAdminKey, options)
}

export const generateSystemAdminRefreshJWT = (data, options = {}) => {
    const systemAdminKey = configuration().api.systemAdminRefreshJwtSecretKey
    return jwt.sign(data, systemAdminKey, options)
}
export const verifySystemAdminRefreshTokenJWT = async (token, options = {}) => {
    const systemAdminKey = configuration().api.systemAdminRefreshJwtSecretKey
    return await jwt.verify(token, systemAdminKey, options)
}
