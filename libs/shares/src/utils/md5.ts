import * as md5 from 'md5'

export const hashMd5 = (data: any): string => {
    const md5Hash = md5(data)
    return md5Hash
}
