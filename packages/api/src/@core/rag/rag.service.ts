import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { Injectable } from '@nestjs/common';
import { EmbeddingService } from './embedding/embedding.service';
import { FileInfo } from './types';
import { VectorDatabaseService } from './vecdb/vecdb.service';
import { S3Service } from '@@core/s3/s3.service';

@Injectable()
export class RagService {
  constructor(
    private readonly queues: BullQueueService,
    private embeddingService: EmbeddingService,
    private vectorDatabaseService: VectorDatabaseService,
    private s3Service: S3Service,
  ) {}

  async queryEmbeddings(query: string, topK = 5) {
    const queryEmbedding = await this.embeddingService.embedQuery(query);
    const results = await this.vectorDatabaseService.queryEmbeddings(
      queryEmbedding,
      topK,
    );
    return results.map((match: any) => ({
      chunk: match.metadata.text,
      metadata: match.metadata,
      score: match.score,
      embedding: match.embedding,
    }));
  }

  async queueDocumentProcessing(
    filesInfo: FileInfo[],
    projectId: string,
    linkedUserId: string,
  ) {
    // todo: check if RAG is enabled for the current projectId and for pricing concerns
    // paywall before doing s3 + rag
    await this.s3Service.uploadFilesFromUrls(filesInfo, linkedUserId);
    await this.queues.getRagDocumentQueue().add('batchDocs', {
      filesInfo,
      projectId,
      linkedUserId,
    });
    return { message: `Documents queued for processing` };
  }
}
