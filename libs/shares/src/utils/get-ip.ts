// import * as os from 'os'
// import configuration from '@shares/config/configuration'

// export const getIpAddress = (): string | null => {
//     const interfaces = os.networkInterfaces()
//     const targetInterface = configuration().network.networkInterface

//     if (interfaces[targetInterface]) {
//         const ipAddress = interfaces[targetInterface]
//             .filter((item) => item.family === 'IPv4' && !item.internal)
//             .map((item) => item.address)

//         if (ipAddress.length > 0) {
//             return ipAddress[0]
//         }
//     }

//     return null
// }
