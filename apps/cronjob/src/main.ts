import { BootstrapConsole } from 'nestjs-console'
import { AppConsoleModule } from './modules/console/app-console.module'

const bootstrap = new BootstrapConsole({
    module: AppConsoleModule,
    useDecorators: true,
})
bootstrap.init().then(async (app) => {
    try {
        await app.init()
        try {
            await bootstrap.boot()
        } catch (error) {
            console.log('error ben boot', error)
        }
        await app.close()
    } catch (error) {
        console.log(error)
        await app.close()
        process.exit(1)
    }
})
