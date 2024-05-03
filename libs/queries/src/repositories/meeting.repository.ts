import { Repository } from 'typeorm'
import { CustomRepository } from '@shares/decorators'
import {
    IPaginationOptions,
    paginateRaw,
    Pagination,
} from 'nestjs-typeorm-paginate'
import { Meeting } from '@entities/meeting.entity'
import { CreateMeetingDto, GetAllMeetingDto, UpdateMeetingDto } from '../dtos'
import {
    MeetingTime,
    MeetingType,
    StatusMeeting,
} from '@shares/constants/meeting.const'
import { CreateBoardMeetingDto } from '@dtos/board-meeting.dto'

@CustomRepository(Meeting)
export class MeetingRepository extends Repository<Meeting> {
    async getAllMeetings(
        companyId: number,
        userId: number,
        canUserCreateMeeting: boolean,
        options: IPaginationOptions & GetAllMeetingDto,
    ): Promise<Pagination<Meeting>> {
        const searchQuery = options.searchQuery || ''
        const sortField = options.sortField
        const sortOrder = options.sortOrder
        const type = options.type
        const meetingType = options.meetingType
        const queryBuilder = this.createQueryBuilder('meetings')
            .select([
                'meetings.id',
                'meetings.title',
                'meetings.startTime',
                'meetings.endTime',
                'meetings.meetingLink',
                'meetings.status',
                'meetings.note',
                'meetings.type',
            ])
            .distinct(true)
        if (canUserCreateMeeting) {
            queryBuilder.leftJoin(
                'user_meetings',
                'userMeeting',
                'userMeeting.meetingId = meetings.id AND userMeeting.userId = :userId',
                { userId },
            )
        } else {
            queryBuilder.innerJoin(
                'user_meetings',
                'userMeeting',
                'userMeeting.meetingId = meetings.id AND userMeeting.userId = :userId',
                { userId },
            )
        }

        queryBuilder
            .addSelect(
                `(CASE 
                WHEN userMeeting.status = '0' THEN true
                ELSE false 
            END)`,
                'isJoined',
            )

            .where('meetings.companyId= :companyId', {
                companyId: companyId,
            })

        if (type == MeetingTime.FUTURE) {
            queryBuilder.andWhere(
                'meetings.startTime >= :currentDateTime OR (meetings.startTime <= :currentDateTime AND meetings.endTime >= :currentDateTime)',
                {
                    currentDateTime: new Date(),
                },
            )
        } else {
            queryBuilder.andWhere('meetings.endTime <= :currentDateTime', {
                currentDateTime: new Date(),
            })
        }
        if (searchQuery) {
            queryBuilder.andWhere('(meetings.title like :searchQuery)', {
                searchQuery: `%${searchQuery}%`,
            })
        }
        if (meetingType) {
            queryBuilder.andWhere('meetings.type = :typeMeeting', {
                typeMeeting: meetingType,
            })
        }
        if (sortField && sortOrder) {
            queryBuilder.orderBy(`meetings.${sortField}`, sortOrder)
        }

        return paginateRaw(queryBuilder, options)
    }

    async getInternalListMeeting(
        companyId: number,
        options: IPaginationOptions & GetAllMeetingDto,
    ): Promise<Meeting[]> {
        const searchQuery = options.searchQuery || ''
        const sortField = options.sortField
        const sortOrder = options.sortOrder
        const type = options.type
        const meetingType = options.meetingType
        const queryBuilder = this.createQueryBuilder('meetings')
            .select(['meetings.id'])
            .where('meetings.companyId= :companyId', {
                companyId: companyId,
            })

        if (type == MeetingTime.FUTURE) {
            queryBuilder.andWhere(
                'meetings.startTime >= :currentDateTime OR (meetings.startTime <= :currentDateTime AND meetings.endTime >= :currentDateTime)',
                {
                    currentDateTime: new Date(),
                },
            )
        } else {
            queryBuilder.andWhere('meetings.endTime <= :currentDateTime', {
                currentDateTime: new Date(),
            })
        }
        if (searchQuery) {
            queryBuilder.andWhere('(meetings.title like :searchQuery)', {
                searchQuery: `%${searchQuery}%`,
            })
        }
        if (meetingType) {
            queryBuilder.andWhere('meetings.type = :typeMeeting', {
                typeMeeting: meetingType,
            })
        }
        if (sortField && sortOrder) {
            queryBuilder.orderBy(`meetings.${sortField}`, sortOrder)
        }

        const listMeetings = await queryBuilder.getMany()
        return listMeetings
    }

    async getInternalMeetingById(id: number): Promise<Meeting> {
        const meeting = await this.createQueryBuilder('meeting')
            .select()
            .where('meeting.id = :id', {
                id,
            })
            .leftJoinAndSelect('meeting.meetingFiles', 'meetingFiles')
            .leftJoinAndSelect('meeting.proposals', 'proposals')
            .getOne()

        return meeting
    }

    async getMeetingByIdAndCompanyId(
        id: number,
        companyId: number,
    ): Promise<Meeting> {
        // const meeting = await this.findOne({
        //     where: {
        //         id,
        //         companyId,
        //     },
        //     relations: ['creator', 'meetingFiles', 'proposals'],
        // })

        const meeting = await this.createQueryBuilder('meeting')
            .select()
            .where('meeting.id = :id', {
                id,
            })
            .andWhere('meeting.companyId = :companyId', {
                companyId,
            })
            .leftJoinAndSelect('meeting.meetingFiles', 'meetingFiles')
            .leftJoinAndSelect('meeting.proposals', 'proposals')
            .leftJoin('proposals.creator', 'creator')
            .addSelect([
                'creator.username',
                'creator.email',
                'creator.avatar',
                'creator.defaultAvatarHashColor',
            ])
            .leftJoinAndSelect('proposals.proposalFiles', 'proposalFiles')
            // .addSelect(['proposalFiles.url', 'proposalFiles.id'])
            .getOne()

        return meeting
    }
    async getMeetingByMeetingIdAndCompanyId(
        id: number,
        companyId: number,
    ): Promise<Meeting> {
        const meeting = await this.findOne({
            where: {
                id,
                companyId,
            },
        })
        return meeting
    }
    async createMeeting(
        createMeetingDto: CreateMeetingDto,
        typeMeeting: MeetingType,
        creatorId: number,
        companyId: number,
    ): Promise<Meeting> {
        const meeting = await this.create({
            ...createMeetingDto,
            type: typeMeeting,
            creatorId,
            companyId,
        })
        await meeting.save()
        return meeting
    }

    async updateMeeting(
        meetingId: number,
        updateMeetingDto: UpdateMeetingDto,
        creatorId: number,
        companyId: number,
    ): Promise<Meeting> {
        await this.createQueryBuilder('meetings')
            .update(Meeting)
            .set({
                title: updateMeetingDto.title,
                note: updateMeetingDto.note,
                startTime: updateMeetingDto.startTime,
                endTime: updateMeetingDto.endTime,
                endVotingTime: updateMeetingDto.endVotingTime,
                meetingLink: updateMeetingDto.meetingLink,
                status: updateMeetingDto.status,
            })
            .where('meetings.id = :meetingId', { meetingId })
            .execute()
        const meeting = await this.getMeetingByMeetingIdAndCompanyId(
            meetingId,
            companyId,
        )
        return meeting
    }

    async findMeetingByStatusAndEndTimeVoting(
        status: StatusMeeting,
        meetingIdsAppearedInTransaction,
    ): Promise<Meeting[]> {
        const queryBuilder = this.createQueryBuilder('meetings').select([
            'meetings.id',
            'meetings.title',
            'meetings.startTime',
            'meetings.endTime',
            'meetings.endVotingTime',
            'meetings.meetingLink',
            'meetings.status',
            'meetings.companyId',
        ])
        if (
            meetingIdsAppearedInTransaction &&
            meetingIdsAppearedInTransaction.length > 0
        ) {
            queryBuilder.where(
                'meetings.id NOT IN (:...meetingIdsAppearedInTransaction)',
                { meetingIdsAppearedInTransaction },
            )
        }
        queryBuilder
            .andWhere('meetings.status = :status', {
                status: status,
            })
            .andWhere('meetings.endVotingTime < :currentDateTime', {
                currentDateTime: new Date(),
            })

        const meetings = await queryBuilder.getMany()
        return meetings
    }

    //Board Meeting
    async createBoardMeeting(
        createMeetingDto: CreateBoardMeetingDto,
        typeMeeting: MeetingType,
        creatorId: number,
        companyId: number,
    ): Promise<Meeting> {
        const meeting = await this.create({
            ...createMeetingDto,
            type: typeMeeting,
            creatorId,
            companyId,
        })
        await meeting.save()
        return meeting
    }

    async getBoardMeetingByIdAndCompanyId(
        meetingId: number,
        companyId: number,
    ): Promise<Meeting> {
        const boardMeeting = await this.createQueryBuilder('meeting')
            .where('meeting.id = :id', { id: meetingId })
            .andWhere('meeting.companyId = :companyId', { companyId })
            .leftJoinAndSelect('meeting.meetingFiles', 'meetingFiles')
            .leftJoinAndSelect('meeting.proposals', 'proposals')
            .leftJoin('proposals.creator', 'creator')
            .addSelect([
                'creator.username',
                'creator.email',
                'creator.avatar',
                'creator.defaultAvatarHashColor',
            ])
            .leftJoinAndSelect('proposals.proposalFiles', 'proposalFiles')
            .leftJoinAndSelect('meeting.candidates', 'candidate')
            .leftJoin('candidate.typeElection', 'typeElection')
            .addSelect([
                'typeElection.id',
                'typeElection.status',
                'typeElection.description',
            ])
            .getOne()

        return boardMeeting
    }
}
