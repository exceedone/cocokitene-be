/* guide  https://gist.github.com/anchan828/9e569f076e7bc18daf21c652f7c3d012 */
/* eslint-disable @typescript-eslint/ban-types */
import { SetMetadata } from '@nestjs/common'
export const TYPEORM_EX_CUSTOM_REPOSITORY = 'TYPEORM_EX_CUSTOM_REPOSITORY'
export const CustomRepository = (entity: Function): ClassDecorator =>
    SetMetadata(TYPEORM_EX_CUSTOM_REPOSITORY, entity)
