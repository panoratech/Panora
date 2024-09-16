import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { ProcessedChunk } from '@@core/rag/types';
import { Injectable, OnModuleInit } from '@nestjs/common';
import weaviate, { WeaviateClient, ApiKey } from 'weaviate-ts-client';

@Injectable()
export class WeaviateService implements OnModuleInit {
  private client: WeaviateClient;
  private className: string;

  constructor(private envService: EnvironmentService) {}

  async onModuleInit() {
    return;
  }

  async initialize(credentials: string[]) {
    this.client = weaviate.client({
      scheme: 'https',
      host: credentials[1],
      apiKey: new ApiKey(credentials[0]),
    });
    this.className = credentials[2];
    await this.ensureClassExists();
  }

  private async ensureClassExists() {
    const classObj = {
      class: this.className,
      vectorizer: 'none', // assuming you're providing your own vectors
      multiTenancyConfig: {
        enabled: true,
      },
      properties: [
        { name: 'text', dataType: ['text'] },
        { name: 'metadata', dataType: ['object'] },
      ],
    };

    try {
      await this.client.schema.classCreator().withClass(classObj).do();
    } catch (error) {
      // Class might already exist, which is fine
      console.log(
        `Class ${this.className} might already exist:`,
        error.message,
      );
    }
  }

  async storeEmbeddings(
    fileId: string,
    chunks: ProcessedChunk[],
    embeddings: number[][],
    linkedUserId: string,
  ) {
    const batchSize = 100;
    const tenant = `ns_${linkedUserId}`;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batcher = this.client.batch.objectsBatcher();
      const batch = chunks.slice(i, i + batchSize);

      batch.forEach((chunk, index) => {
        batcher.withObject({
          class: this.className,
          id: `${fileId}_${i + index}`,
          properties: {
            text: chunk.text,
            metadata: chunk.metadata,
          },
          vector: embeddings[i + index],
          tenant: tenant,
        });
      });

      await batcher.do();
    }
  }

  async queryEmbeddings(
    queryEmbedding: number[],
    topK: number,
    linkedUserId: string,
  ) {
    const tenant = `ns_${linkedUserId}`;
    const result = await this.client.graphql
      .get()
      .withClassName(this.className)
      .withTenant(tenant)
      .withFields('text metadata')
      .withNearVector({ vector: queryEmbedding })
      .withLimit(topK)
      .do();

    return result.data.Get[this.className] || [];
  }

  /*async deleteEmbeddings(fileId: string, tenant: string) {
    await this.client.batch
      .objectsBatcher()
      .withTenant(tenant)
      .withClassName(this.className)
      .withWhere({
        operator: 'Like',
        path: ['id'],
        valueString: `${fileId}*`,
      })
      .withDelete()
      .do();
  }*/
}
