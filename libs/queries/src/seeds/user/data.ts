import { PartialType } from '@nestjs/mapped-types'
import { User } from '@entities/user.entity'
import { uuid } from '@shares/utils/uuid'

export class InsertUserDto extends PartialType(User) {}
export const userSuperAdminData: InsertUserDto[] = [
    {
        walletAddress: '0xB0C6abf8BAC799F27FE4D46ab2Ffb683129f59b1',
        username: 'HuyNT',
        email: 'huynt@trithucmoi.co',
        nonce: uuid(),
        avatar: 'https://i.seadn.io/gae/ehUSQhnsGoxsqszQdgzLAhD50gnhgdFCsnqlNdsOqINRTNtlwVoMDVdVVskBPuCp0KLtnhuYzCZCaLm_craTEjpafyfrXSjNpco8MUE',
        companyId: 1,
        shareQuantity: 100,
    },
]
export const userAdminData: InsertUserDto[] = [
    {
        walletAddress: '0x63598A8EC6F454b7295Dd747D98Dc81440102bA4',
        username: 'HuyNT 2',
        email: 'huynt2@trithucmoi.co',
        nonce: uuid(),
        avatar: 'https://i.seadn.io/gae/ehUSQhnsGoxsqszQdgzLAhD50gnhgdFCsnqlNdsOqINRTNtlwVoMDVdVVskBPuCp0KLtnhuYzCZCaLm_craTEjpafyfrXSjNpco8MUE',
        companyId: 1,
        shareQuantity: 100,
    },
]

export const userNomallyData: InsertUserDto[] = [
    {
        walletAddress: '0xb6bcc605163714d0af8544aad8aabde7a54ae179',
        username: 'DaiTV',
        email: 'daitv@trithucmoi.co',
        nonce: uuid(),
        avatar: 'https://i.seadn.io/gae/ehUSQhnsGoxsqszQdgzLAhD50gnhgdFCsnqlNdsOqINRTNtlwVoMDVdVVskBPuCp0KLtnhuYzCZCaLm_craTEjpafyfrXSjNpco8MUE',
        companyId: 1,
        shareQuantity: 100,
    },
    {
        walletAddress: '0x0dafca0b9ea95f78bce5489d51e36682e93fad1f',
        username: 'VuongLQ',
        email: 'vuonglq@gmail.com',
        nonce: uuid(),
        avatar: 'https://i.seadn.io/gcs/files/86ba42e7b54bcdfd6fb2c6fc7d1f2fc3.jpg',
        companyId: 2,
        shareQuantity: 100,
    },
    {
        walletAddress: '0x6a0b754cd732acee9654cc653f3de360da3e6c94',
        username: 'ThaoNTP',
        email: 'thaontp@trithucmoi.co',
        nonce: uuid(),
        avatar: 'https://i.seadn.io/gcs/files/86ba42e7b54bcdfd6fb2c6fc7d1f2fc3.jpg',
        companyId: 2,
        shareQuantity: 100,
    },
    {
        walletAddress: '0xd2c8de021766f0409f880fc1b3bc0aa4a2c5fea1',
        username: 'PhuongNA',
        email: 'phuongna@gmail.com',
        nonce: uuid(),
        avatar: 'https://i.seadn.io/gcs/files/86ba42e7b54bcdfd6fb2c6fc7d1f2fc3.jpg',
        companyId: 3,
        shareQuantity: 100,
    },
]

export const userShareholderData: InsertUserDto[] = [
    {
        walletAddress: '0x44534dcC2b343794c9C47D61766844e762e2D617',
        username: 'kiennv',
        email: 'kiennv@trithucmoi.co',
        nonce: uuid(),
        avatar: 'https://i.seadn.io/gae/ehUSQhnsGoxsqszQdgzLAhD50gnhgdFCsnqlNdsOqINRTNtlwVoMDVdVVskBPuCp0KLtnhuYzCZCaLm_craTEjpafyfrXSjNpco8MUE',
        companyId: 3,
        shareQuantity: 100,
    },
]
