import { Injectable } from '@nestjs/common';
import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { EmbeddingModelType } from './embedding.service';

@Injectable()
export class EmbeddingCredentialsService {
  constructor(
    private envService: EnvironmentService,
    private connectionsStrategiesService: ConnectionsStrategiesService,
  ) {}

  async getEmbeddingCredentials(
    projectId: string,
    embeddingModel: EmbeddingModelType,
  ): Promise<string[]> {
    const type = `embeddingModel.${embeddingModel.toLowerCase()}`;
    const isCustom =
      await this.connectionsStrategiesService.isCustomCredentials(
        projectId,
        type,
      );

    if (isCustom) {
      return this.getCustomCredentials(projectId, type);
    } else {
      return this.getManagedCredentials(embeddingModel);
    }
  }

  private async getCustomCredentials(
    projectId: string,
    type: string,
  ): Promise<string[]> {
    return this.connectionsStrategiesService.getConnectionStrategyData(
      projectId,
      type,
      ['embeddingApiKey'],
    );
  }

  private getManagedCredentials(embeddingModel: EmbeddingModelType): string[] {
    switch (embeddingModel) {
      case 'OPENAI_ADA_SMALL_512':
      case 'OPENAI_ADA_SMALL_1536':
      case 'OPENAI_ADA_LARGE_256':
      case 'OPENAI_ADA_LARGE_1024':
      case 'OPENAI_ADA_LARGE_3072':
        return [this.envService.getOpenAIApiKey()];
      case 'COHERE_MULTILINGUAL_V3':
        return [this.envService.getCohereApiKey()];
      case 'JINA':
        return [this.envService.getJinaApiKey()];
      default:
        throw new Error(`Unsupported embedding model: ${embeddingModel}`);
    }
  }
}
