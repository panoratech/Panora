import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { ProcessedChunk } from '@@core/rag/types';
import { Injectable } from '@nestjs/common';
import { DataType, MilvusClient } from '@zilliz/milvus2-sdk-node';

@Injectable()
export class MilvusService {
  private client: MilvusClient;
  private collectionName: string;

  constructor(private envService: EnvironmentService) {}

  async onModuleInit() {
    return;
  }

  async initialize(credentials: string[]) {
    this.client = new MilvusClient({
      address: credentials[0],
    });
    this.collectionName = credentials[1];
    await this.client.connectPromise;
  }

  async storeEmbeddings(
    fileId: string,
    chunks: ProcessedChunk[],
    embeddings: number[][],
    linkedUserId: string,
  ) {
    const tenant = `ns_${linkedUserId}`;
    const hasCollection = await this.client.hasCollection({
      collection_name: this.collectionName,
    });
    if (!hasCollection) {
      await this.client.createCollection({
        collection_name: this.collectionName,
        fields: [
          {
            name: 'id',
            description: 'ID field',
            data_type: DataType.VarChar,
            is_primary_key: true,
            max_length: 100,
          },
          {
            name: 'tenant',
            description: 'Tenant field',
            data_type: DataType.VarChar,
            max_length: 100,
          },
          {
            name: 'text',
            description: 'Text field',
            data_type: DataType.VarChar,
            max_length: 65535,
          },
          {
            name: 'embedding',
            description: 'Vector field',
            data_type: DataType.FloatVector,
            dim: embeddings[0].length,
          },
        ],
        enable_dynamic_field: true,
      });

      // Create index
      await this.client.createIndex({
        collection_name: this.collectionName,
        field_name: 'embedding',
        index_type: 'HNSW',
        params: { efConstruction: 10, M: 4 },
        metric_type: 'L2',
      });
    }

    const data = chunks.map((chunk, i) => ({
      id: `${fileId}_${i}`,
      tenant,
      text: chunk.text,
      embedding: embeddings[i],
    }));

    await this.client.insert({
      collection_name: this.collectionName,
      data,
    });

    await this.client.loadCollectionSync({
      collection_name: this.collectionName,
    });
  }

  async queryEmbeddings(
    queryEmbedding: number[],
    topK: number,
    linkedUserId: string,
  ) {
    const tenant = `ns_${linkedUserId}`;
    const res = await this.client.search({
      collection_name: this.collectionName,
      vector: queryEmbedding,
      filter: `tenant == "${tenant}"`,
      params: { nprobe: 10 },
      limit: topK,
      output_fields: ['text'],
    });

    return res.results.map((hit) => ({
      id: hit.id,
      text: hit.text,
      score: hit.score,
    }));
  }
}
