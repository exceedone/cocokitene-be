import { PartialType } from '@nestjs/mapped-types'
import { Permission } from '@entities/permission.entity'
import { PermissionEnum } from '@shares/constants/permission.const'

export class InsertPermissionDto extends PartialType(Permission) {}
export const permissionData: InsertPermissionDto[] = [
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
        key: PermissionEnum.LIST_ROLES_NORMAL,
        description:
            'the user with this right can see list role normal of user in the system',
    },
    {
        key: PermissionEnum.LIST_ROLES_INTERNAL,
        description:
            'the user with this right can see list role internal of user in the system',
    },
    {
        key: PermissionEnum.LIST_PERMISSIONS,
        description:
            'the user with this right can see list permission of user in the system',
    },
    {
        key: PermissionEnum.SETTING_PERMISSION_FOR_ROLES,
        description:
            'the user with this right can set up list permission for each role in the company',
    },
    {
        key: PermissionEnum.CREATE_ROLE,
        description:
            'the user with this right can create role of user in the system',
    },
    {
        key: PermissionEnum.DETAIL_PROFILE,
        description: 'the user with this right can see detail profile',
    },
    {
        key: PermissionEnum.EDIT_PROFILE,
        description: 'the user with this right can update their own profile',
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
        key: PermissionEnum.LIST_ROLE_MTG,
        description:
            'the user with this right can see list role_mtg in the my company',
    },
    {
        key: PermissionEnum.SEND_MAIL_TO_BOARD,
        description: 'the user with this right can send email to boards',
    },
    {
        key: PermissionEnum.CHECK_DATA_MEETING,
        description:
            'the user with this right can check data of shareholder Meeting',
    },
    {
        key: PermissionEnum.CHECK_DATA_BOARD_MEETING,
        description: 'the user with this right can check data of Board Meeting',
    },
]
