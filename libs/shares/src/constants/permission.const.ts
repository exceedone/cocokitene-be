export enum PermissionEnum {
    CREATE_ACCOUNT = 'create_account',
    EDIT_ACCOUNT = 'edit_account',
    DETAIL_ACCOUNT = 'detail_account',
    LIST_ACCOUNT = 'list_account',
    SHAREHOLDERS_MTG = 'list_shareholder_meeting',
    CREATE_MEETING = 'create_shareholder_meeting',
    EDIT_MEETING = 'edit_shareholder_meeting',
    DETAIL_MEETING = 'detail_shareholder_meeting',
    SEND_MAIL_TO_SHAREHOLDER = 'send_mail_to_shareholder',
    SETTING_PERMISSION_FOR_ROLES = 'setting_permission_for_roles',
    LIST_SHAREHOLDERS = 'list_shareholder',
    DETAIL_SHAREHOLDERS = 'detail_shareholder',
    EDIT_SHAREHOLDERS = 'edit_shareholder',
    CREATE_BOARD_MEETING = 'create_board_meeting',
    BOARD_MEETING = 'list_board_meeting',
    DETAIL_BOARD_MEETING = 'detail_board_meeting',
    EDIT_BOARD_MEETING = 'edit_board_meeting',
    SEND_MAIL_TO_BOARD = 'send_mail_to_board',
    BASIC_PERMISSION = 'basic_permission',
}

export enum StatePermisisionForRolesEnum {
    ENABLED = 1,
    DISABLED = 0,
}
