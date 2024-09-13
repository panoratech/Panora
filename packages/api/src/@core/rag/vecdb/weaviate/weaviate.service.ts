import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { ProcessedChunk } from '@@core/rag/types';
import { Injectable } from '@nestjs/common';
import weaviate from 'weaviate-client';

@Injectable()
export class WeaviateService {
  private client: any;

  constructor(private envService: EnvironmentService) {
    //this.initialize();
  }

  async initialize() {
    const weaviate_creds = this.envService.getWeaviateCreds();
    this.client = weaviate.connectToWeaviateCloud(weaviate_creds.url, {
      authCredentials: new weaviate.ApiKey(weaviate_creds.apiKey),
    });
  }

  async storeEmbeddings(
    fileId: string,
    chunks: ProcessedChunk[],
    embeddings: number[][],
  ) {
    const className = 'Document';
    for (let i = 0; i < chunks.length; i++) {
      await this.client.data
        .creator()
        .withClassName(className)
        .withId(`${fileId}_${i}`)
        .withProperties({ text: chunks[i].text, ...chunks[i].metadata })
        .withVector(embeddings[i])
        .do();
    }
  }

  async queryEmbeddings(queryEmbedding: number[], topK: number) {
    const className = 'Document';
    const result = await this.client.graphql
      .get()
      .withClassName(className)
      .withFields('text metadata')
      .withNearVector({ vector: queryEmbedding })
      .withLimit(topK)
      .do();
    return result.data.Get[className] || [];
  }
}
