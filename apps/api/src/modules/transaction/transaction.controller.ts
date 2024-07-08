import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
// import { PermissionEnum } from "@shares/constants";
// import { Permission } from "@shares/decorators/permission.decorator";
import { JwtAuthGuard } from '@shares/guards/jwt-auth.guard'
import { TransactionService } from './transaction.service'

@Controller('transactions')
@ApiTags('transactions')
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) {}

    @Get('/:id')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    // @Permission(PermissionEnum.BOARD_MEETING)
    async getMeetingTransactionByMeetingId(@Param('id') meetingId: number) {
        const transaction =
            await this.transactionService.getTransactionByMeetingId(meetingId)

        return transaction
    }
}
