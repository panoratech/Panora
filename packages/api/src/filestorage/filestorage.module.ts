import { Module } from '@nestjs/common';
import { FileModule } from './file/file.module';
import { DriveModule } from './drive/drive.module';
import { SharedLinkModule } from './sharedlink/sharedlink.module';
import { PermissionModule } from './permission/permission.module';
import { FolderModule } from './folder/folder.module';

@Module({
  imports: [
    DriveModule,
    FileModule,
    FolderModule,
    SharedLinkModule,
    PermissionModule,
    SharedLinkModule,
  ],
  providers: [],
  exports: [
    DriveModule,
    FileModule,
    FolderModule,
    SharedLinkModule,
    PermissionModule,
    SharedLinkModule,
  ],
})
export class FileStorageModule {}
