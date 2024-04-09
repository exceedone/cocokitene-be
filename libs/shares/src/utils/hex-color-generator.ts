/* eslint-disable @typescript-eslint/no-var-requires */
const { randomBytes } = require('crypto')

const SIZE = 256
const HEX = []
let BUFFER
let IDX = 0

// Initialize a list of HEX color codes from '00' to 'ff'
for (let i = 0; i < 256; i++) {
    HEX[i] = (i + 256).toString(16).substring(1)
}

export const generateRandomHexColor = (): string => {
    if (!BUFFER || IDX + 3 > SIZE) {
        BUFFER = randomBytes(SIZE)
        IDX = 0
    }

    let out = ''
    for (let i = 0; i < 3; i++) {
        const tmp = BUFFER[i + IDX]
        out += HEX[tmp]
    }

    IDX += 3

    return `#${out}`
}
