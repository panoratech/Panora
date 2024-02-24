import { Global, Module } from '@nestjs/common';
import { StytchService } from './stytch.service';

@Global()
@Module({
  providers: [StytchService],
  exports: [StytchService],
})
export class StytchModule {}
