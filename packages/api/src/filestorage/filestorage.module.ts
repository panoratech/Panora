import { Module } from '@nestjs/common';
import { FileModule } from './file/file.module';
import { DriveModule } from './drive/drive.module';
import { SharedLinkModule } from './sharedlink/sharedlink.module';
import { PermissionModule } from './permission/permission.module';
import { FolderModule } from './folder/folder.module';
import { UserModule } from './user/user.module';
import { GroupModule } from './group/group.module';
import { FileStorageUnificationService } from './@lib/@unification';

@Module({
  imports: [
    DriveModule,
    FileModule,
    FolderModule,
    GroupModule,
    UserModule,
    SharedLinkModule,
    PermissionModule,
    SharedLinkModule,
  ],
  providers: [FileStorageUnificationService],
  exports: [
    DriveModule,
    FileModule,
    FolderModule,
    GroupModule,
    UserModule,
    SharedLinkModule,
    PermissionModule,
    SharedLinkModule,
  ],
})
export class FileStorageModule {}
