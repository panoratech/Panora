import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { ProcessedChunk } from '@@core/rag/types';
import { Injectable } from '@nestjs/common';
import { DataType, MilvusClient } from '@zilliz/milvus2-sdk-node';

@Injectable()
export class MilvusService {
  private client: MilvusClient;

  constructor(private envService: EnvironmentService) {
    //this.initialize();
  }

  async initialize() {
    const milvus_creds = this.envService.getMilvusCreds();
    this.client = new MilvusClient({
      address: milvus_creds.address,
    });
    await this.client.connectPromise;
  }

  async storeEmbeddings(
    fileId: string,
    chunks: ProcessedChunk[],
    embeddings: number[][],
  ) {
    const collection_name = fileId;
    await this.client.createCollection({
      collection_name,
      fields: [
        {
          name: 'id',
          description: 'ID field',
          data_type: DataType.VarChar,
          is_primary_key: true,
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
    });
    const data = chunks.map((chunk, i) => ({
      id: `${fileId}_${i}`,
      text: chunk.text,
      embedding: embeddings[i],
    }));

    await this.client.insert({
      collection_name,
      data,
    });

    await this.client.createIndex({
      collection_name,
      field_name: 'embedding',
      index_type: 'HNSW',
      params: { efConstruction: 10, M: 4 },
      metric_type: 'L2',
    });

    await this.client.loadCollectionSync({
      collection_name,
    });
  }

  async queryEmbeddings(queryEmbedding: number[], topK: number) {
    const collections = await this.client.listCollections();
    const results = await Promise.all(
      collections.data.map(async (collection) => {
        const res = await this.client.search({
          collection_name: collection.name,
          vector: queryEmbedding,
          filter: '',
          params: { nprobe: 10 },
          limit: topK,
          output_fields: ['text'],
        });
        return res.results.map((hit) => ({
          id: hit.id,
          text: hit.text,
          score: hit.score,
        }));
      }),
    );
    return results
      .flat()
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}
