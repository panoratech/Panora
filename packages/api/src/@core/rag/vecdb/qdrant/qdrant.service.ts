import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { ProcessedChunk } from '@@core/rag/types';
import { Injectable } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';

@Injectable()
export class QdrantDBService {
  private client: QdrantClient;

  constructor(private envService: EnvironmentService) {
    //this.initialize();
  }

  async initialize() {
    const creds = this.envService.getQdrantCreds();
    this.client = new QdrantClient({
      url: `https://${creds.baseUrl}.us-east-0-1.aws.cloud.qdrant.io`,
      apiKey: creds.apiKey,
    });
  }

  async storeEmbeddings(
    fileId: string,
    chunks: ProcessedChunk[],
    embeddings: number[][],
  ) {
    await this.client.createCollection(fileId, {
      vectors: { size: embeddings[0].length, distance: 'Cosine' },
    });
    await this.client.upsert(fileId, {
      wait: true,
      points: chunks.map((chunk, i) => ({
        id: `${fileId}_${i}`,
        vector: embeddings[i],
        payload: {
          text: chunk.text,
          ...chunk.metadata,
        },
      })),
    });
  }

  async queryEmbeddings(queryEmbedding: number[], topK: number) {
    const { collections } = await this.client.getCollections();
    const results = await Promise.all(
      collections.map(async (collection) => {
        const result = await this.client.search(collection.name, {
          vector: queryEmbedding,
          limit: topK,
        });
        return result.map((item) => item.payload);
      }),
    );
    return results.flat().slice(0, topK);
  }
}
