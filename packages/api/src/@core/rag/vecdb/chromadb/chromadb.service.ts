import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { ProcessedChunk } from '@@core/rag/types';
import { Injectable } from '@nestjs/common';
import { ChromaClient, Collection } from 'chromadb';

@Injectable()
export class ChromaDBService {
  private client: ChromaClient;
  private collection: Collection;

  constructor(private envService: EnvironmentService) {}

  async onModuleInit() {
    return;
  }

  async initialize(credentials: string[]) {
    this.client = new ChromaClient({
      path: credentials[0],
    });
    this.collection = await this.client.getOrCreateCollection({
      name: credentials[1],
    });
  }

  async storeEmbeddings(
    fileId: string,
    chunks: ProcessedChunk[],
    embeddings: number[][],
    linkedUserId: string,
  ) {
    await this.collection.add({
      ids: chunks.map((_, i) => `${fileId}_${i}`),
      embeddings: embeddings,
      metadatas: chunks.map((chunk) => ({
        text: chunk.text,
        ...chunk.metadata,
        user_id: `ns_${linkedUserId}`,
      })),
    });
  }

  async queryEmbeddings(
    queryEmbedding: number[],
    topK: number,
    linkedUserId: string,
  ) {
    const result = await this.collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: topK,
      where: { user_id: `ns_${linkedUserId}` },
    });
    return result.metadatas[0];
  }
}
