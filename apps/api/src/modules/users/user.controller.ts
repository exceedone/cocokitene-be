import {
    CreateUserDto,
    GetAllUsersDto,
    UpdateOwnProfileDto,
    UpdateUserDto,
} from '@dtos/user.dto'
import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserScope } from '@shares/decorators/user.decorator'
import { WalletAddressDto } from 'libs/queries/src/dtos/base.dto'
import { UserService } from './user.service'
import { JwtAuthGuard } from '@shares/guards/jwt-auth.guard'
import { User } from '@entities/user.entity'
import { PermissionEnum } from '@shares/constants'
import { Permission } from '@shares/decorators/permission.decorator'

@Controller('users')
@ApiTags('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('get-nonce')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    async getNonceByUserWalletAddress(
        @Query() walletAddressDto: WalletAddressDto,
    ) {
        const nonceValue =
            await this.userService.getUserNonceByUserWalletAddress(
                walletAddressDto,
            )
        return nonceValue
    }

    @Get('')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.LIST_ACCOUNT)
    async getAllUserByCompany(
        @Query() getAllUsersDto: GetAllUsersDto,
        @UserScope() user: User,
    ) {
        const companyId = user?.companyId
        const users = await this.userService.getAllUsersCompany(
            getAllUsersDto,
            companyId,
        )
        return users
    }

    @Get('/:id')
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.DETAIL_ACCOUNT)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    async getUserById(@Param('id') userId: number, @UserScope() user: User) {
        const companyId = user?.companyId
        const userDetails = await this.userService.getUserById(
            companyId,
            userId,
        )
        return userDetails
    }
    @Patch(':userId')
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.EDIT_ACCOUNT)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async updateUser(
        @Param('userId') userId: number,
        @Body() updateUserDto: UpdateUserDto,
        @UserScope() user: User,
    ) {
        const companyId = user?.companyId
        const updateUser = await this.userService.updateUser(
            companyId,
            userId,
            updateUserDto,
        )
        return updateUser
    }

    @Post('')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth()
    @Permission(PermissionEnum.CREATE_ACCOUNT)
    async createUser(
        @Body() createUserDto: CreateUserDto,
        @UserScope() user: User,
    ) {
        const companyId = user?.companyId
        const createdUser = await this.userService.createUser(
            companyId,
            createUserDto,
            user.email,
        )
        return createdUser
    }

    @Patch('/profile/:userId')
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.EDIT_PROFILE)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async updateOwnProfile(
        @Param('userId') userId: number,
        @Body() updateOwnProfileDto: UpdateOwnProfileDto,
        @UserScope() user: User,
    ) {
        const updateUser = await this.userService.updateOwnProfile(
            user,
            userId,
            updateOwnProfileDto,
        )
        return updateUser
    }
    //profile
    @Get('/profile/:id')
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.DETAIL_PROFILE)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    async getProfileOwnById(
        @Param('id') userId: number,
        @UserScope() user: User,
    ) {
        const profileOwnDetail = await this.userService.getProfileOwnById(
            userId,
            user,
        )
        return profileOwnDetail
    }
}
