import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { CohereEmbeddings } from '@langchain/cohere';
import { Document } from '@langchain/core/documents';
import { OpenAIEmbeddings } from '@langchain/openai';
import { JinaEmbeddings } from '@langchain/community/embeddings/jina';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { EmbeddingCredentialsService } from './embedding.credentials.service';

export type EmbeddingModelType =
  | 'OPENAI_ADA_SMALL_512'
  | 'OPENAI_ADA_SMALL_1536'
  | 'OPENAI_ADA_LARGE_256'
  | 'OPENAI_ADA_LARGE_1024'
  | 'OPENAI_ADA_002'
  | 'OPENAI_ADA_LARGE_3072'
  | 'COHERE_MULTILINGUAL_V3'
  | 'JINA';

@Injectable()
export class EmbeddingService implements OnModuleInit {
  private embeddings: OpenAIEmbeddings | CohereEmbeddings | JinaEmbeddings;

  constructor(
    private envService: EnvironmentService,
    private connectionsStrategiesService: ConnectionsStrategiesService,
    private embeddingCredentialsService: EmbeddingCredentialsService,
  ) {}

  async onModuleInit() {
    // Initialize with default settings
    console.log();
  }

  async initializeEmbeddings(projectId: string) {
    let embeddingType: EmbeddingModelType;
    let apiKey: string;

    if (projectId) {
      const activeStrategies = await this.connectionsStrategiesService.getConnectionStrategiesForProject(projectId);
      const activeEmbeddingStrategy = activeStrategies.find(
        (strategy) => strategy.type.startsWith('embedding_model.') && strategy.status,
      );

      if (activeEmbeddingStrategy) {
        embeddingType = activeEmbeddingStrategy.type.split('.')[1].toUpperCase() as EmbeddingModelType;
        [apiKey] = await this.embeddingCredentialsService.getEmbeddingCredentials(projectId, embeddingType);
      } else {
        embeddingType = 'OPENAI_ADA_002';
        apiKey = this.envService.getOpenAIApiKey();
      }
    } else {
      embeddingType = 'OPENAI_ADA_002';
      apiKey = this.envService.getOpenAIApiKey();
    }

    switch (embeddingType) {
      case 'OPENAI_ADA_002':
      case 'OPENAI_ADA_SMALL_512':
      case 'OPENAI_ADA_SMALL_1536':
      case 'OPENAI_ADA_LARGE_256':
      case 'OPENAI_ADA_LARGE_1024':
      case 'OPENAI_ADA_LARGE_3072':
        this.embeddings = new OpenAIEmbeddings({
          openAIApiKey: apiKey,
          modelName: this.getOpenAIModelName(embeddingType),
        });
        break;
      case 'COHERE_MULTILINGUAL_V3':
        this.embeddings = new CohereEmbeddings({
          apiKey,
          model: 'multilingual-22-12',
        });
        break;
      case 'JINA':
        this.embeddings = new JinaEmbeddings({
          apiKey,
        });
        break;
      default:
        throw new Error(`Unsupported embedding type: ${embeddingType}`);
    }
  }

  private getOpenAIModelName(type: EmbeddingModelType): string {
    const modelMap: { [key: string]: string } = {
      OPENAI_ADA_002: 'text-embedding-ada-002',
      OPENAI_ADA_SMALL_512: 'text-embedding-3-small',
      OPENAI_ADA_SMALL_1536: 'text-embedding-3-small',
      OPENAI_ADA_LARGE_256: 'text-embedding-3-large',
      OPENAI_ADA_LARGE_1024: 'text-embedding-3-large',
      OPENAI_ADA_LARGE_3072: 'text-embedding-3-large',
    };
    return modelMap[type] || 'text-embedding-ada-002';
  }

  async generateEmbeddings(chunks: Document[], projectId: string) {
    await this.initializeEmbeddings(projectId);
    const texts = chunks.map((chunk) => chunk.pageContent);
    return this.embeddings.embedDocuments(texts);
  }

  async embedQuery(query: string, projectId?: string) {
    // await this.initializeEmbeddings(projectId);
    return this.embeddings.embedQuery(query);
  }
}