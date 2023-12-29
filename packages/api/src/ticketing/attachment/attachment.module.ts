import { Module } from '@nestjs/common';
import { AttachmentController } from './attachment.controller';

@Module({
  controllers: [AttachmentController],
})
export class AttachmentModule {}
