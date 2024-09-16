import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { ProcessedChunk } from '@@core/rag/types';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';

@Injectable()
export class QdrantDBService implements OnModuleInit {
  private client: QdrantClient;
  private collectionName: string;

  constructor(private envService: EnvironmentService) {}

  async onModuleInit() {
    return;
  }

  async initialize(credentials: string[]) {
    this.client = new QdrantClient({
      url: `https://${credentials[1]}.us-east-0-1.aws.cloud.qdrant.io`,
      apiKey: credentials[0],
    });
    this.collectionName = credentials[2];
    await this.ensureCollectionExists();
  }

  private async ensureCollectionExists() {
    try {
      await this.client.getCollection(this.collectionName);
    } catch (error) {
      if (error.status === 404) {
        await this.client.createCollection(this.collectionName, {
          vectors: { size: 1536, distance: 'Cosine' }, // Adjust size as needed
          optimizers_config: {
            indexing_threshold: 20000,
          },
          replication_factor: 2,
        });
      } else {
        throw error;
      }
    }
  }

  async storeEmbeddings(
    fileId: string,
    chunks: ProcessedChunk[],
    embeddings: number[][],
    linkedUserId: string,
  ) {
    const tenantId = `ns_${linkedUserId}`;
    await this.client.upsert(this.collectionName, {
      wait: true,
      points: chunks.map((chunk, i) => ({
        id: `${fileId}_${i}`,
        vector: embeddings[i],
        payload: {
          text: chunk.text,
          ...chunk.metadata,
          tenant_id: tenantId,
          file_id: fileId,
        },
      })),
    });
  }

  async queryEmbeddings(
    queryEmbedding: number[],
    topK: number,
    linkedUserId: string,
  ) {
    const tenantId = `ns_${linkedUserId}`;
    const result = await this.client.search(this.collectionName, {
      vector: queryEmbedding,
      limit: topK,
      filter: {
        must: [
          {
            key: 'tenant_id',
            match: { value: tenantId },
          },
        ],
      },
    });
    return result.map((item) => item.payload);
  }

  /*async deleteEmbeddings(tenantId: string, fileId: string) {
    await this.client.delete(this.collectionName, {
      filter: {
        must: [
          {
            key: 'tenant_id',
            match: { value: tenantId },
          },
          {
            key: 'file_id',
            match: { value: fileId },
          },
        ],
      },
    });
  }

  async listTenants() {
    const result = await this.client.scroll(this.collectionName, {
      filter: {
        must: [
          {
            key: 'tenant_id',
            match: { value: '' },
          },
        ],
      },
      limit: 100,
    });
    const tenants = new Set(
      result.points.map((point) => point.payload.tenant_id),
    );
    return Array.from(tenants);
  }*/
}
