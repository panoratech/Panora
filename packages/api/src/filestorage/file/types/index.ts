import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedFilestorageFileInput,
  UnifiedFilestorageFileOutput,
} from './model.unified';
import { OriginalFileOutput } from '@@core/utils/types/original/original.file-storage';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';
import { S3Client } from '@aws-sdk/client-s3';
export interface IFileService extends IBaseObjectService {
  addFile?(
    fileData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalFileOutput>>;

  streamFileToS3?(
    file_id: string,
    linkedUserId: string,
    s3Client: S3Client,
    s3Key: string,
  ): Promise<any>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalFileOutput[]>>;
}

export interface IFileMapper {
  desunify(
    source: UnifiedFilestorageFileInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalFileOutput | OriginalFileOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedFilestorageFileOutput | UnifiedFilestorageFileOutput[]>;
}
