import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { ProcessedChunk } from '@@core/rag/types';
import { Injectable } from '@nestjs/common';
import { Namespace, Turbopuffer } from '@turbopuffer/turbopuffer';

@Injectable()
export class TurboPufferService {
  private client: Turbopuffer;
  private namespace: Namespace;

  constructor(private envService: EnvironmentService) {
    //this.initialize();
  }

  async initialize() {
    this.client = new Turbopuffer({
      apiKey: this.envService.getTurboPufferApiKey(),
    });
    this.namespace = this.client.namespace('panora-namespace');
  }

  async storeEmbeddings(
    fileId: string,
    chunks: ProcessedChunk[],
    embeddings: number[][],
  ) {
    const vectors = chunks.map((chunk, i) => ({
      id: `${fileId}_${i}`,
      vector: embeddings[i],
      attributes: { text: chunk.text, ...chunk.metadata },
    }));
    await this.namespace.upsert({
      vectors,
      distance_metric: 'cosine_distance',
    });
  }

  async queryEmbeddings(queryEmbedding: number[], topK: number) {
    const results = await this.namespace.query({
      vector: queryEmbedding,
      top_k: topK,
      distance_metric: 'cosine_distance',
      include_attributes: ['text'],
      include_vectors: false,
    });
    return results;
  }
}
