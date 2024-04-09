export const MEETING_ABI: any = [
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'uint256',
                name: 'id_meeting',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'numberInBlockchain',
                type: 'uint256',
            },
        ],
        name: 'CreateMeeting',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [],
        name: 'EIP712DomainChanged',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'uint8',
                name: 'version',
                type: 'uint8',
            },
        ],
        name: 'Initialized',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address',
                name: '_validator',
                type: 'address',
            },
        ],
        name: 'LogAddValidator',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address',
                name: '_validator',
                type: 'address',
            },
        ],
        name: 'LogRemoveValidator',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'previousOwner',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'newOwner',
                type: 'address',
            },
        ],
        name: 'OwnershipTransferred',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
        ],
        name: 'Paused',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
        ],
        name: 'Unpaused',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'uint256',
                name: 'id_meeting',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'step',
                type: 'uint256',
            },
        ],
        name: 'UpdateFileOfMeeting',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'uint256',
                name: 'id_meeting',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'step',
                type: 'uint256',
            },
        ],
        name: 'UpdateFileOfProposalMeeting',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'uint256',
                name: 'id_meeting',
                type: 'uint256',
            },
        ],
        name: 'UpdateMeeting',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'uint256',
                name: 'id_meeting',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'step',
                type: 'uint256',
            },
        ],
        name: 'UpdateParticipantMeeting',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'uint256',
                name: 'id_proposal',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'step',
                type: 'uint256',
            },
        ],
        name: 'UpdateParticipantProposal',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'uint256',
                name: 'id_meeting',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'step',
                type: 'uint256',
            },
        ],
        name: 'UpdateProposalMeeting',
        type: 'event',
    },
    {
        inputs: [],
        name: 'CREATE_MEETING_TYPEHASH',
        outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'UPDATE_MEETING_TYPEHASH',
        outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256', name: '_meeting_id', type: 'uint256' },
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'meeting_file_id',
                        type: 'uint256',
                    },
                    { internalType: 'string', name: 'url', type: 'string' },
                ],
                internalType: 'struct BaseMeeting.FileOfMeetingData[]',
                name: '_newFileMeetings',
                type: 'tuple[]',
            },
            { internalType: 'uint256', name: '_step', type: 'uint256' },
        ],
        name: 'addFileMeetingNoSign',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256', name: '_meeting_id', type: 'uint256' },
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'proposal_file_id',
                        type: 'uint256',
                    },
                    { internalType: 'string', name: 'url', type: 'string' },
                ],
                internalType: 'struct BaseMeeting.FileOfProposalData[]',
                name: '_newFileProposals',
                type: 'tuple[]',
            },
            { internalType: 'uint256', name: '_step', type: 'uint256' },
        ],
        name: 'addFileProposalNoSign',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256', name: '_meeting_id', type: 'uint256' },
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'proposal_id',
                        type: 'uint256',
                    },
                    { internalType: 'string', name: 'title', type: 'string' },
                    {
                        internalType: 'uint256',
                        name: 'voted_quantity',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'un_voted_quantity',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'not_vote_yet_quantity',
                        type: 'uint256',
                    },
                ],
                internalType: 'struct BaseMeeting.ProposalMeetingData[]',
                name: '_newProposals',
                type: 'tuple[]',
            },
            { internalType: 'uint256', name: '_step', type: 'uint256' },
        ],
        name: 'addProposalsNoSign',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256', name: '_meeting_id', type: 'uint256' },
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'user_id',
                        type: 'uint256',
                    },
                    {
                        internalType: 'string',
                        name: 'user_name',
                        type: 'string',
                    },
                    { internalType: 'string', name: 'role', type: 'string' },
                    { internalType: 'string', name: 'status', type: 'string' },
                ],
                internalType: 'struct BaseMeeting.ParticipantMeetingData[]',
                name: '_newParticipantMeetings',
                type: 'tuple[]',
            },
            { internalType: 'uint256', name: '_step', type: 'uint256' },
        ],
        name: 'addUserNoSign',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256', name: '_proposal_id', type: 'uint256' },
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'user_id',
                        type: 'uint256',
                    },
                    { internalType: 'string', name: 'result', type: 'string' },
                ],
                internalType: 'struct BaseMeeting.ParticipantVotingData[]',
                name: '_newParticipantProposals',
                type: 'tuple[]',
            },
            { internalType: 'uint256', name: '_step', type: 'uint256' },
        ],
        name: 'addUserProposalNoSign',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: '_newValidator', type: 'address' },
        ],
        name: 'addValidator',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256', name: '_meetind_id', type: 'uint256' },
        ],
        name: 'checkIsCreated',
        outputs: [
            { internalType: 'bool', name: '', type: 'bool' },
            { internalType: 'uint256', name: '', type: 'uint256' },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256', name: '_meeting_id', type: 'uint256' },
            { internalType: 'string', name: '_title', type: 'string' },
            { internalType: 'uint256', name: '_start_time', type: 'uint256' },
            { internalType: 'uint256', name: '_end_time', type: 'uint256' },
            { internalType: 'string', name: '_meeting_link', type: 'string' },
            { internalType: 'uint256', name: '_company_id', type: 'uint256' },
            {
                internalType: 'uint256',
                name: '_shareholders_totals',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: '_shareholders_joined',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: '_total_meeting_shares',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: '_joined_meeting_shares',
                type: 'uint256',
            },
        ],
        name: 'createNoSign',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'eip712Domain',
        outputs: [
            { internalType: 'bytes1', name: 'fields', type: 'bytes1' },
            { internalType: 'string', name: 'name', type: 'string' },
            { internalType: 'string', name: 'version', type: 'string' },
            { internalType: 'uint256', name: 'chainId', type: 'uint256' },
            {
                internalType: 'address',
                name: 'verifyingContract',
                type: 'address',
            },
            { internalType: 'bytes32', name: 'salt', type: 'bytes32' },
            {
                internalType: 'uint256[]',
                name: 'extensions',
                type: 'uint256[]',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256', name: '_meeting_id', type: 'uint256' },
        ],
        name: 'getFileMeetingData',
        outputs: [
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'meeting_file_id',
                        type: 'uint256',
                    },
                    { internalType: 'string', name: 'url', type: 'string' },
                ],
                internalType: 'struct BaseMeeting.FileOfMeetingData[]',
                name: '',
                type: 'tuple[]',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256', name: '_meeting_id', type: 'uint256' },
        ],
        name: 'getFileProposalData',
        outputs: [
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'proposal_file_id',
                        type: 'uint256',
                    },
                    { internalType: 'string', name: 'url', type: 'string' },
                ],
                internalType: 'struct BaseMeeting.FileOfProposalData[]',
                name: '',
                type: 'tuple[]',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256', name: '_meeting_id', type: 'uint256' },
        ],
        name: 'getMeetingData',
        outputs: [
            {
                components: [
                    { internalType: 'uint256', name: 'id', type: 'uint256' },
                    { internalType: 'string', name: 'title', type: 'string' },
                    {
                        internalType: 'uint256',
                        name: 'start_time',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'end_time',
                        type: 'uint256',
                    },
                    {
                        internalType: 'string',
                        name: 'meeting_link',
                        type: 'string',
                    },
                    {
                        internalType: 'uint256',
                        name: 'company_id',
                        type: 'uint256',
                    },
                    {
                        internalType: 'string[]',
                        name: 'files',
                        type: 'string[]',
                    },
                    { internalType: 'bool', name: 'exsited', type: 'bool' },
                    {
                        internalType: 'uint256',
                        name: 'shareholders_totals',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'shareholders_joined',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'total_meeting_shares',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'joined_meeting_shares',
                        type: 'uint256',
                    },
                    {
                        components: [
                            {
                                internalType: 'uint256',
                                name: 'proposal_id',
                                type: 'uint256',
                            },
                            {
                                internalType: 'string',
                                name: 'title',
                                type: 'string',
                            },
                            {
                                internalType: 'uint256',
                                name: 'voted_quantity',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'un_voted_quantity',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'not_vote_yet_quantity',
                                type: 'uint256',
                            },
                        ],
                        internalType:
                            'struct BaseMeeting.ProposalMeetingData[]',
                        name: 'proposals',
                        type: 'tuple[]',
                    },
                    {
                        internalType: 'uint256',
                        name: 'length_proposals',
                        type: 'uint256',
                    },
                    {
                        components: [
                            {
                                internalType: 'uint256',
                                name: 'user_id',
                                type: 'uint256',
                            },
                            {
                                internalType: 'string',
                                name: 'user_name',
                                type: 'string',
                            },
                            {
                                internalType: 'string',
                                name: 'role',
                                type: 'string',
                            },
                            {
                                internalType: 'string',
                                name: 'status',
                                type: 'string',
                            },
                        ],
                        internalType:
                            'struct BaseMeeting.ParticipantMeetingData[]',
                        name: 'participant_meetings',
                        type: 'tuple[]',
                    },
                    {
                        internalType: 'uint256',
                        name: 'length_participants',
                        type: 'uint256',
                    },
                    {
                        components: [
                            {
                                internalType: 'uint256',
                                name: 'proposal_file_id',
                                type: 'uint256',
                            },
                            {
                                internalType: 'string',
                                name: 'url',
                                type: 'string',
                            },
                        ],
                        internalType: 'struct BaseMeeting.FileOfProposalData[]',
                        name: 'file_of_proposals',
                        type: 'tuple[]',
                    },
                    {
                        internalType: 'uint256',
                        name: 'length_file_of_proposals',
                        type: 'uint256',
                    },
                    {
                        components: [
                            {
                                internalType: 'uint256',
                                name: 'meeting_file_id',
                                type: 'uint256',
                            },
                            {
                                internalType: 'string',
                                name: 'url',
                                type: 'string',
                            },
                        ],
                        internalType: 'struct BaseMeeting.FileOfMeetingData[]',
                        name: 'file_of_meetings',
                        type: 'tuple[]',
                    },
                    {
                        internalType: 'uint256',
                        name: 'length_file_of_meetings',
                        type: 'uint256',
                    },
                ],
                internalType: 'struct BaseMeeting.MeetingData',
                name: '',
                type: 'tuple',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256', name: '_meeting_id', type: 'uint256' },
        ],
        name: 'getProposalMeetingData',
        outputs: [
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'proposal_id',
                        type: 'uint256',
                    },
                    { internalType: 'string', name: 'title', type: 'string' },
                    {
                        internalType: 'uint256',
                        name: 'voted_quantity',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'un_voted_quantity',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'not_vote_yet_quantity',
                        type: 'uint256',
                    },
                ],
                internalType: 'struct BaseMeeting.ProposalMeetingData[]',
                name: '',
                type: 'tuple[]',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256', name: '_meeting_id', type: 'uint256' },
        ],
        name: 'getUserInfoData',
        outputs: [
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'user_id',
                        type: 'uint256',
                    },
                    {
                        internalType: 'string',
                        name: 'user_name',
                        type: 'string',
                    },
                    { internalType: 'string', name: 'role', type: 'string' },
                    { internalType: 'string', name: 'status', type: 'string' },
                ],
                internalType: 'struct BaseMeeting.ParticipantMeetingData[]',
                name: '',
                type: 'tuple[]',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getValidators',
        outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address[]',
                name: '_validator',
                type: 'address[]',
            },
        ],
        name: 'initialize',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'owner',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'pause',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'paused',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: '_validator', type: 'address' },
        ],
        name: 'removeValidator',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'renounceOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'totalMeeting',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'totalProposal',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'newOwner', type: 'address' },
        ],
        name: 'transferOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'unpause',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256', name: '_meeting_id', type: 'uint256' },
            { internalType: 'string', name: '_title', type: 'string' },
            { internalType: 'uint256', name: '_start_time', type: 'uint256' },
            { internalType: 'uint256', name: '_end_time', type: 'uint256' },
            { internalType: 'string', name: '_meeting_link', type: 'string' },
            { internalType: 'uint256', name: '_company_id', type: 'uint256' },
            {
                internalType: 'uint256',
                name: '_shareholders_totals',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: '_shareholders_joined',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: '_total_meeting_shares',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: '_joined_meeting_shares',
                type: 'uint256',
            },
        ],
        name: 'updateNoSign',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
]
