import { PartialType } from '@nestjs/mapped-types'
import { Permission } from '@entities/permission.entity'
import { PermissionEnum } from '@shares/constants/permission.const'

export class InsertPermissionDto extends PartialType(Permission) {}
export const permissionData: InsertPermissionDto[] = [
    {
        key: PermissionEnum.BASIC_PERMISSION,
        description: 'the basic permission for all role in system',
    },
    {
        key: PermissionEnum.LIST_ACCOUNT,
        description:
            'the user with this right can see a list users in the system',
    },
    {
        key: PermissionEnum.DETAIL_ACCOUNT,
        description:
            'the user with this right can see information of user detail',
    },
    {
        key: PermissionEnum.CREATE_ACCOUNT,
        description: 'the user with this right can create account',
    },
    {
        key: PermissionEnum.EDIT_ACCOUNT,
        description:
            "the user with this right can edit the user's account information",
    },
    {
        key: PermissionEnum.SHAREHOLDERS_MTG,
        description:
            'the user with this right can see a list meetings in the system',
    },
    {
        key: PermissionEnum.CREATE_MEETING,
        description:
            'the user with this right can create a meeting for the company',
    },
    {
        key: PermissionEnum.EDIT_MEETING,
        description:
            "the user with this right can edit information of company's meeting",
    },
    {
        key: PermissionEnum.DETAIL_MEETING,
        description:
            'the user with this right can see information of meeting detail',
    },
    {
        key: PermissionEnum.SEND_MAIL_TO_SHAREHOLDER,
        description: 'the user with this right can send email to shareholders',
    },
    {
        key: PermissionEnum.SETTING_PERMISSION_FOR_ROLES,
        description:
            'the user with this right can set up list permission for each role in the company',
    },
    {
        key: PermissionEnum.LIST_SHAREHOLDERS,
        description:
            'the user with this right can see list shareholders in the my company',
    },
    {
        key: PermissionEnum.DETAIL_SHAREHOLDERS,
        description:
            'the user with this right can see information of Shareholder detail',
    },
    {
        key: PermissionEnum.EDIT_SHAREHOLDERS,
        description:
            'the user with this right can update shareholders in the my company',
    },
    {
        key: PermissionEnum.BOARD_MEETING,
        description:
            'the user with this right can see list board meeting in the my company',
    },
    {
        key: PermissionEnum.CREATE_BOARD_MEETING,
        description:
            'the user with this right can create board meeting in the my company',
    },
    {
        key: PermissionEnum.DETAIL_BOARD_MEETING,
        description:
            'the user with this right can see detail board meeting in the my company',
    },
    {
        key: PermissionEnum.EDIT_BOARD_MEETING,
        description:
            'the user with this right can see detail board meeting in the my company',
    },
    {
        key: PermissionEnum.SEND_MAIL_TO_BOARD,
        description: 'the user with this right can send email to boards',
    },
]
