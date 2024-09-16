import { Document } from '@langchain/core/documents';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ProcessedChunk } from '../types';
import { ChromaDBService } from './chromadb/chromadb.service';
import { MilvusService } from './milvus/milvus.service';
import { PineconeService } from './pinecone/pinecone.service';
import { QdrantDBService } from './qdrant/qdrant.service';
import { TurboPufferService } from './turbopuffer/turbopuffer.service';
import { WeaviateService } from './weaviate/weaviate.service';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { VectorDbCredentialsService } from './vecdb.credentials.service';

export type VectorDbProvider =
  | 'CHROMADB'
  | 'PINECONE'
  | 'QDRANT'
  | 'TURBOPUFFER'
  | 'MILVUS'
  | 'WEAVIATE';

@Injectable()
export class VectorDatabaseService implements OnModuleInit {
  private vectorDb: any;

  constructor(
    private pineconeService: PineconeService,
    private weaviateService: WeaviateService,
    private turboPufferService: TurboPufferService,
    private chromaDBService: ChromaDBService,
    private qdrantService: QdrantDBService,
    private milvusService: MilvusService,
    private connectionsStrategiesService: ConnectionsStrategiesService,
    private vectorDbCredentialsService: VectorDbCredentialsService,
  ) {}

  onModuleInit() {
    console.log();
  }

  async init(projectId: string) {
    const activeStrategies =
      await this.connectionsStrategiesService.getConnectionStrategiesForProject(
        projectId,
      );
    const activeVectorDbStrategy = activeStrategies.find(
      (strategy) =>
        strategy.type.startsWith('vectorDatabase.') && strategy.status,
    );

    let dbType: string;
    let credentials: string[];

    if (activeVectorDbStrategy) {
      dbType = activeVectorDbStrategy.type.split('.')[1].toLowerCase();
      credentials =
        await this.vectorDbCredentialsService.getVectorDbCredentials(
          projectId,
          dbType,
        );
    } else {
      // Fall back to managed credentials
      dbType = 'pinecone';
      credentials =
        this.vectorDbCredentialsService.getManagedCredentials(dbType);
    }
    switch (dbType) {
      case 'pinecone':
        this.vectorDb = this.pineconeService;
        break;
      case 'weaviate':
        this.vectorDb = this.weaviateService;
        break;
      case 'turbopuffer':
        this.vectorDb = this.turboPufferService;
        break;
      case 'chromadb':
        this.vectorDb = this.chromaDBService;
        break;
      case 'qdrant':
        this.vectorDb = this.qdrantService;
        break;
      case 'milvus':
        this.vectorDb = this.milvusService;
        break;
      default:
        throw new Error(`Unsupported vector database type: ${dbType}`);
    }

    await this.vectorDb.initialize(credentials);
  }

  async storeEmbeddings(
    fileId: string,
    chunks: Document<Record<string, any>>[],
    embeddings: number[][],
    projectId: string,
    linkedUserId: string,
  ) {
    await this.init(projectId);
    const processedChunks: ProcessedChunk[] = chunks.map((chunk) => ({
      text: chunk.pageContent,
      metadata: chunk.metadata,
    }));
    return this.vectorDb.storeEmbeddings(
      fileId,
      processedChunks,
      embeddings,
      projectId,
      linkedUserId,
    );
  }

  async queryEmbeddings(
    queryEmbedding: number[],
    topK: number,
    linkedUserId: string,
  ) {
    return this.vectorDb.queryEmbeddings(queryEmbedding, topK, linkedUserId);
  }
}
