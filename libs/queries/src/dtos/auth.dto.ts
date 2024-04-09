import { IsEmail, IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: '0xB0C6abf8BAC799F27FE4D46ab2Ffb683129f59b1',
    })
    @Transform(({ value }) => {
        return value?.toLowerCase()
    })
    walletAddress: string

    // @IsString()
    // @IsNotEmpty()
    // @ApiProperty({
    //     example:
    //         '0x7558dbb143dc091343a3f8244e815132a14243a4dae899a02b23716da839945f7e436876882f59a30c5a768c32fb512f68232626fc81d6f0053ebcda3de90d191b',
    // })
    // signature: string
}
export class RefreshTokenDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MmNlZGM1ZjFiZTIyY2RiNTkwMjJkNWUiLCJlbWFpbCI6ImFkbWluQGdtYWlsLmNvbSIsImNyZWF0ZWRBdCI6IjIwMjItMDctMTNUMTQ6NTM6MTkuNDg5WiIsInVwZGF0ZWRBdCI6IjIwMjItMDctMTNUMTc6MDM6MTYuMjIyWiIsIl9fdiI6MCwidXNlcm5hbWUiOiJBZHJpZW5OZ3V5ZW4iLCJpZCI6IjYyY2VkYzVmMWJlMjJjZGI1OTAyMmQ1ZSIsImlhdCI6MTY1NzczNTkyOSwiZXhwIjoxNjU3NzM2ODI5fQ.eA4Kf4xw_vMAyZluCtW9mtcg73ylMJmsjacPsEi5CMA',
    })
    refreshToken: string
}
export class SystemAdminRefreshTokenDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MmNlZGM1ZjFiZTIyY2RiNTkwMjJkNWUiLCJlbWFpbCI6ImFkbWluQGdtYWlsLmNvbSIsImNyZWF0ZWRBdCI6IjIwMjItMDctMTNUMTQ6NTM6MTkuNDg5WiIsInVwZGF0ZWRBdCI6IjIwMjItMDctMTNUMTc6MDM6MTYuMjIyWiIsIl9fdiI6MCwidXNlcm5hbWUiOiJBZHJpZW5OZ3V5ZW4iLCJpZCI6IjYyY2VkYzVmMWJlMjJjZGI1OTAyMmQ1ZSIsImlhdCI6MTY1NzczNTkyOSwiZXhwIjoxNjU3NzM2ODI5fQ.eA4Kf4xw_vMAyZluCtW9mtcg73ylMJmsjacPsEi5CMA',
    })
    systemAdminRefreshToken: string
}
export class GetSignedMessageDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: '0x9b500a4B354914d420c3D1497AEe4Ba9d45b7Df0',
    })
    @Transform(({ value }) => {
        return value?.toLowerCase()
    })
    walletAddress: string
}

export class LoginByPassword {
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({
        example: 'nguyenkien123ns@gmail.com',
    })
    email: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'nguyenkien',
    })
    password: string
}

export class ForgotPasswordDto {
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({
        example: 'nguyenkien123ns@gmail.com',
    })
    email: string
}

export class LoginUserByPassword {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: '0123456789',
    })
    taxOfCompany: string

    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({
        example: 'nguyenkien123ns@gmail.com',
    })
    email: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'nguyenkien',
    })
    password: string
}
