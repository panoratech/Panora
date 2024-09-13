import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { ProcessedChunk } from '@@core/rag/types';
import { Injectable } from '@nestjs/common';
import { ChromaClient } from 'chromadb';

@Injectable()
export class ChromaDBService {
  private client: ChromaClient;

  constructor(private envService: EnvironmentService) {
    //this.initialize();
  }

  async initialize() {
    this.client = new ChromaClient({
      path: this.envService.getChromaCreds(),
    });
  }

  async storeEmbeddings(
    fileId: string,
    chunks: ProcessedChunk[],
    embeddings: number[][],
  ) {
    const collection = await this.client.createCollection({ name: fileId });
    await collection.add({
      ids: chunks.map((_, i) => `${fileId}_${i}`),
      embeddings: embeddings,
      metadatas: chunks.map((chunk) => ({
        text: chunk.text,
        ...chunk.metadata,
      })),
    });
  }

  async queryEmbeddings(queryEmbedding: number[], topK: number) {
    const collections = await this.client.listCollections();
    const results = await Promise.all(
      collections.map(async (collection) => {
        const collectionInstance = await this.client.getCollection({
          name: collection.name,
        });
        const result = await collectionInstance.query({
          queryEmbeddings: [queryEmbedding],
          nResults: topK,
        });
        return result.metadatas[0];
      }),
    );
    return results.flat().slice(0, topK);
  }
}
