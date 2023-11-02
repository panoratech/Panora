import { Module } from '@nestjs/common';
import { OrganisationsService } from './organisations.service';

@Module({
  providers: [OrganisationsService],
})
export class OrganisationsModule {}
