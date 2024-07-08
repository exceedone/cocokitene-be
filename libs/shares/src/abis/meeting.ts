export const MEETING_ABI: any = [
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
                indexed: false,
                internalType: 'string',
                name: '_keyMeeting',
                type: 'string',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'numberInBlockchain',
                type: 'uint256',
            },
        ],
        name: 'MeetingCreated',
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
        inputs: [],
        name: 'CREATE_MEETING_TYPEHASH',
        outputs: [
            {
                internalType: 'bytes32',
                name: '',
                type: 'bytes32',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'UPDATE_MEETING_TYPEHASH',
        outputs: [
            {
                internalType: 'bytes32',
                name: '',
                type: 'bytes32',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_newValidator',
                type: 'address',
            },
        ],
        name: 'addValidator',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'string',
                name: '_keyMeeting',
                type: 'string',
            },
            {
                components: [
                    {
                        internalType: 'string',
                        name: 'key',
                        type: 'string',
                    },
                    {
                        internalType: 'string',
                        name: 'hashValue',
                        type: 'string',
                    },
                ],
                internalType: 'struct BaseMeeting.MeetingHash[]',
                name: '_newMeetingHash',
                type: 'tuple[]',
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
            {
                internalType: 'bytes1',
                name: 'fields',
                type: 'bytes1',
            },
            {
                internalType: 'string',
                name: 'name',
                type: 'string',
            },
            {
                internalType: 'string',
                name: 'version',
                type: 'string',
            },
            {
                internalType: 'uint256',
                name: 'chainId',
                type: 'uint256',
            },
            {
                internalType: 'address',
                name: 'verifyingContract',
                type: 'address',
            },
            {
                internalType: 'bytes32',
                name: 'salt',
                type: 'bytes32',
            },
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
            {
                internalType: 'string',
                name: '_keyMeeting',
                type: 'string',
            },
        ],
        name: 'getMeetingData',
        outputs: [
            {
                components: [
                    {
                        components: [
                            {
                                internalType: 'string',
                                name: 'key',
                                type: 'string',
                            },
                            {
                                internalType: 'string',
                                name: 'hashValue',
                                type: 'string',
                            },
                        ],
                        internalType: 'struct BaseMeeting.MeetingHash[]',
                        name: 'meetingHashes',
                        type: 'tuple[]',
                    },
                    {
                        internalType: 'string',
                        name: '_keyMeeting',
                        type: 'string',
                    },
                    {
                        internalType: 'bool',
                        name: 'existed',
                        type: 'bool',
                    },
                ],
                internalType: 'struct BaseMeeting.MeetingDetails',
                name: '',
                type: 'tuple',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getValidators',
        outputs: [
            {
                internalType: 'address[]',
                name: '',
                type: 'address[]',
            },
        ],
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
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
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
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_validator',
                type: 'address',
            },
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
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'newOwner',
                type: 'address',
            },
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
]
