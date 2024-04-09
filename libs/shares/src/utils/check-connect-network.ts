import { logger } from '@api/modules/loggers/logger'
import { messageLog } from '@shares/exception-filter'
import { Logger } from '@nestjs/common'
import * as dns from 'dns'

// export async function checkInternet() {
//     await require('dns').lookup('google.com',function(err) {
//         if (err && err.code == "ENOTFOUND") {
//             // not connected to the internet
//             Logger.log(`Not connected to the internet`)
//             logger.log('error',`${messageLog.CONNECT_INTERNET_FAILED.message}`)
//         } else {
//             // connected to the internet
//             Logger.log('Connected to the internet')
//             logger.log('info',`${messageLog.CONNECT_INTERNET_SUCCESS.message}`)
//         }
//     })
// }

export async function checkInternet() {
    const isConnected = !!(await dns.promises
        .resolve('google.com')
        .catch(() => {
            console.log('check connect network')
        }))
    if (isConnected) {
        // Connected to the internet
        Logger.log('Connected to the internet')
        logger.log('info', `${messageLog.CONNECT_INTERNET_SUCCESS.message}`)
    } else {
        // not connected to the internet
        Logger.log(`Not connected to the internet`)
        logger.log('error', `${messageLog.CONNECT_INTERNET_FAILED.message}`)
    }
}
