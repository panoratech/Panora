import { Module } from '@nestjs/common';
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [ContactModule],
  providers: [],
  controllers: [],
  exports: [ContactModule],
})
export class CrmModule {}
