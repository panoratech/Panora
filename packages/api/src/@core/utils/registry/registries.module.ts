import { Global, Module } from '@nestjs/common';
import { MappersRegistry } from './mappings.registry';
import { UnificationRegistry } from './unification.registry';


@Global()
@Module({
    providers: [MappersRegistry, UnificationRegistry],
    exports: [MappersRegistry, UnificationRegistry],
})
export class RegistriesModule { }