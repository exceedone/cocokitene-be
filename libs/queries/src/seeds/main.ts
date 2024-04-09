import { NestFactory } from '@nestjs/core'
import { Seeder } from './seeder'
import { SeederModule } from './seeder.module'

async function bootstrap() {
    const appContext = await NestFactory.createApplicationContext(SeederModule)
    const seeder = appContext.get(Seeder)
    await seeder.seed()
}

bootstrap()
    .then(() => {
        process.exit(0)
    })
    .catch(() => {
        process.exit(1)
    })
