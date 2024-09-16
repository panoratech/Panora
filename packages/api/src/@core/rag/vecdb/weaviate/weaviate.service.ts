import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { ProcessedChunk } from '@@core/rag/types';
import { Injectable, OnModuleInit } from '@nestjs/common';
import weaviate, { WeaviateClient, ApiKey } from 'weaviate-client';

@Injectable()
export class WeaviateService implements OnModuleInit {
  private client: WeaviateClient;
  private className: string;

  constructor(private envService: EnvironmentService) {}

  async onModuleInit() {
    return;
  }

  async initialize(credentials: string[]) {
    this.client = await weaviate.connectToWeaviateCloud(credentials[1], {
      authCredentials: new ApiKey(credentials[0]),
    });
    this.className = credentials[2];
    await this.ensureClassExists();
  }

  private async ensureClassExists() {
    try {
      await this.client.collections.create({
        name: this.className,
        multiTenancy: weaviate.configure.multiTenancy({
          enabled: true,
          autoTenantCreation: true,
        }),
      });
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
    const collection = this.client.collections.get(this.className);
    const multiTenant = collection.withTenant(tenant);

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize).map((chunk, index) => ({
        properties: {
          text: chunk.text,
          metadata: chunk.metadata,
        },
        id: `${fileId}_${i + index}`,
        vector: embeddings[i + index],
      }));

      await multiTenant.data.insertMany(batch);
    }
  }

  async queryEmbeddings(
    queryEmbedding: number[],
    topK: number,
    linkedUserId: string,
  ) {
    const tenant = `ns_${linkedUserId}`;
    const multiCollection = this.client.collections.get(this.className);

    const multiTenantObj = multiCollection.withTenant(tenant);
    const result = await multiTenantObj.query.nearVector(queryEmbedding, {
      limit: topK,
      returnMetadata: ['distance'],
    });

    return result;
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
