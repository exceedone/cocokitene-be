/**
 * guide setup: https://gist.github.com/anchan828/9e569f076e7bc18daf21c652f7c3d012
 */
import { DynamicModule, Provider } from '@nestjs/common'
import { getDataSourceToken } from '@nestjs/typeorm'
import { TYPEORM_EX_CUSTOM_REPOSITORY } from '@shares/decorators'

import { DataSource } from 'typeorm'

export class TypeOrmExModule {
    public static forCustomRepository<T extends new (...args: any[]) => any>(
        repositories: T[],
    ): DynamicModule {
        const providers: Provider[] = []

        for (const repository of repositories) {
            const entity = Reflect.getMetadata(
                TYPEORM_EX_CUSTOM_REPOSITORY,
                repository,
            )

            if (!entity) {
                continue
            }

            providers.push({
                inject: [getDataSourceToken()],
                provide: repository,
                useFactory: (dataSource: DataSource): typeof repository => {
                    const baseRepository = dataSource.getRepository<any>(entity)
                    return new repository(
                        baseRepository.target,
                        baseRepository.manager,
                        baseRepository.queryRunner,
                    )
                },
            })
        }

        return {
            exports: providers,
            module: TypeOrmExModule,
            providers,
        }
    }
}
