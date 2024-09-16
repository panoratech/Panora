import { ProcessedChunk } from '@@core/rag/types';
import { Injectable } from '@nestjs/common';
import { Pinecone } from '@pinecone-database/pinecone';

@Injectable()
export class PineconeService {
  private client: Pinecone;
  private indexName: string;

  async initialize(credentials: string[]) {
    this.client = new Pinecone({
      apiKey: credentials[0],
    });
    this.indexName = credentials[1];
  }

  async storeEmbeddings(
    fileId: string,
    chunks: ProcessedChunk[],
    embeddings: number[][],
    linkedUserId: string,
  ) {
    const index = this.client.Index(this.indexName);
    const vectors = chunks.map((chunk, i) => ({
      id: `${fileId}_${i}`,
      values: embeddings[i],
      metadata: this.sanitizeMetadata({
        text: chunk.text,
        ...chunk.metadata,
      }),
    }));
    await index.namespace(`ns_${linkedUserId}`).upsert(vectors);
    console.log(`Inserted embeddings on Pinecone for fileId ${fileId}`);
  }
  private sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(metadata)) {
      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      ) {
        sanitized[key] = value;
      } else if (
        Array.isArray(value) &&
        value.every((item) => typeof item === 'string')
      ) {
        sanitized[key] = value;
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = JSON.stringify(value);
      }
      // Ignore other types
    }
    return sanitized;
  }

  async queryEmbeddings(
    queryEmbedding: number[],
    topK: number,
    linkedUserId: string,
  ) {
    const index = this.client.Index(this.indexName);
    const queryResponse = await index.namespace(`ns_${linkedUserId}`).query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
      includeValues: true,
    });
    return (queryResponse.matches || []).map((match) => ({
      ...match,
      embedding: match.values,
    }));
  }
}
