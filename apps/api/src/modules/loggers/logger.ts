// import moment from 'moment'
import * as moment from 'moment'
import * as winston from 'winston'
import 'winston-daily-rotate-file'

const folderName = process.env.FOLDER_LOG
const customFormat = winston.format.printf(({ level, message, timestamp }) => {
    const formattedTimestamp = moment(timestamp).format('YYYY-MM-DD HH:mm:ss')

    return `${formattedTimestamp} ${level.toUpperCase()} ${message}`
})

const transport = new winston.transports.DailyRotateFile({
    dirname: `${folderName}/`,
    filename: 'cocokitene-%DATE%.log',
    datePattern: 'YYYY-MM-DD', // rotates every day
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        customFormat,
    ),
    options: { flags: 'a' },
})

export const logger = winston.createLogger({
    transports: [transport],
})
