import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class ResetPasswordDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(8, {
        message: 'New password must be at least 8 characters long',
    })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        {
            message:
                'New password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character',
        },
    )
    @Matches(/^(?!.*\s).+$/, {
        message: 'New password cannot contain spaces',
    })
    @ApiProperty({
        required: true,
        example: 'Kien123@!',
    })
    password: string
    @IsNotEmpty()
    @IsString()
    @MinLength(8, {
        message: 'New password must be at least 8 characters long',
    })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        {
            message:
                'New password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character',
        },
    )
    @Matches(/^(?!.*\s).+$/, {
        message: 'New password cannot contain spaces',
    })
    @ApiProperty({
        required: true,
        example: 'Kien123@!',
    })
    confirmPassword: string
}
