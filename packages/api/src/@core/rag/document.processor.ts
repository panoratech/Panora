import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { FileInfo } from './types';
import { VectorDatabaseService } from './vecdb/vecdb.service';
import { S3Service } from '@@core/s3/s3.service';
import { DocumentSplitterService } from './chunking/chunking.service';
import { EmbeddingService } from './embedding/embedding.service';
import { DocumentLoaderService } from './loader/loader.service';

@Processor('RAG_DOCUMENT_PROCESSING')
export class ProcessDocumentProcessor {
  constructor(
    private s3Service: S3Service,
    private documentLoaderService: DocumentLoaderService,
    private documentSplitterService: DocumentSplitterService,
    private embeddingService: EmbeddingService,
    private vectorDatabaseService: VectorDatabaseService,
  ) {}

  @Process('batchDocs')
  async processDocuments(
    job: Job<{
      filesInfo: FileInfo[];
      projectId: string;
      linkedUserId: string;
    }>,
  ) {
    const { filesInfo, projectId, linkedUserId } = job.data;
    const results = [];

    for (const fileInfo of filesInfo) {
      try {
        const readStream = await this.s3Service.getReadStream(fileInfo.s3Key);
        const document =
          await this.documentLoaderService.loadDocumentFromStream(
            readStream,
            fileInfo.fileType,
            fileInfo.s3Key,
          );
        const chunks = await this.documentSplitterService.chunkDocument(
          document,
          fileInfo.fileType,
        );
        // console.log(`chunks for ${fileInfo.id} are ` + JSON.stringify(chunks));
        const embeddings = await this.embeddingService.generateEmbeddings(
          chunks,
          projectId,
        );
        // Split embeddings into smaller batches
        const batchSize = 100; // Adjust this value as needed
        for (let i = 0; i < chunks.length; i += batchSize) {
          const batchChunks = chunks.slice(i, i + batchSize);
          const batchEmbeddings = embeddings.slice(i, i + batchSize);
          await this.vectorDatabaseService.storeEmbeddings(
            fileInfo.id,
            batchChunks,
            batchEmbeddings,
            projectId,
            linkedUserId,
          );
        }
        results.push(`Successfully processed document ${fileInfo.id}`);
      } catch (error) {
        console.error(`Error processing document ${fileInfo.id}:`, error);
        results.push(
          `Failed to process document ${fileInfo.id}: ${error.message}`,
        );
      }
    }

    return results;
  }
}
