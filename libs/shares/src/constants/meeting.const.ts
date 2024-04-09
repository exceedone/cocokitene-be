export enum UserMeetingStatusEnum {
    PARTICIPATE = '0',
    ABSENCE = '1',
}

export enum FileTypes {
    MEETING_INVITATION = '0',
    MEETING_MINUTES = '1',
    REPORTS = '2',
    AVATARS = '3',
    PROPOSAL_FILES = '4',
}

export enum FileTypesToFolderName {
    MEETING_INVITATION = 'invitations',
    MEETING_MINUTES = 'minutes',
    REPORTS = 'reports',
    PROPOSAL_FILES = 'proposals',
    AVATARS = 'avatars',
}

export enum MeetingTime {
    FUTURE = 'future',
    PASS = 'pass',
}

export enum MeetingType {
    SHAREHOLDER_MEETING = '0',
    BOARD_MEETING = '1',
}

export enum StatusMeeting {
    NOT_HAPPEN = '0',
    HAPPENING = '1',
    HAPPENED = '2',
    CANCELED = '3',
    DELAYED = '4',
}

export enum MeetingRole {
    HOST = '0',
    CONTROL_BOARD = '1',
    DIRECTOR = '2',
    ADMINISTRATIVE_COUNCIL = '3',
    SHAREHOLDER = '4',
}

export enum UserJoinMeetingStatusEnum {
    USER_JOIN_WHEN_MEETING_IS_NOT_START = 0,
    USER_JOIN_MEETING_WHEN_MEETING_START_A_LITTLE = 1,
    MEETING_WAS_CANCEL = 2,
    MEETING_WAS_DELAYED = 3,
}
