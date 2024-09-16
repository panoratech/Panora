import { Injectable } from '@nestjs/common';
import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';

@Injectable()
export class VectorDbCredentialsService {
  constructor(
    private envService: EnvironmentService,
    private connectionsStrategiesService: ConnectionsStrategiesService,
  ) {}

  async getVectorDbCredentials(
    projectId: string,
    vectorDb: string,
  ): Promise<string[]> {
    const type = `vectorDatabase.${vectorDb}`;
    const isCustom =
      await this.connectionsStrategiesService.isCustomCredentials(
        projectId,
        type,
      );

    if (isCustom) {
      return this.getCustomCredentials(projectId, type, vectorDb);
    } else {
      return this.getManagedCredentials(vectorDb);
    }
  }

  private async getCustomCredentials(
    projectId: string,
    type: string,
    vectorDb: string,
  ) {
    const attributes = this.getAttributesForVectorDb(vectorDb);
    return this.connectionsStrategiesService.getConnectionStrategyData(
      projectId,
      type,
      attributes,
    );
  }

  getManagedCredentials(vectorDb: string): string[] {
    switch (vectorDb) {
      case 'pinecone':
        return [
          this.envService.getPineconeCreds().apiKey,
          this.envService.getPineconeCreds().indexName,
        ];
      case 'chromadb':
        return [this.envService.getChromaCreds()];
      case 'weaviate':
        const weaviateCreds = this.envService.getWeaviateCreds();
        return [weaviateCreds.apiKey, weaviateCreds.url];
      case 'turbopuffer':
        return [this.envService.getTurboPufferApiKey()];
      case 'qdrant':
        const qdrantCreds = this.envService.getQdrantCreds();
        return [qdrantCreds.apiKey, qdrantCreds.baseUrl];
      default:
        throw new Error(`Unsupported vector database: ${vectorDb}`);
    }
  }

  private getAttributesForVectorDb(vectorDb: string): string[] {
    switch (vectorDb) {
      case 'pinecone':
        return ['apiKey', 'indexName'];
      case 'turbopuffer':
        return ['apiKey'];
      case 'qdrant':
        return ['apiKey', 'baseUrl'];
      case 'chromadb':
        return ['url'];
      case 'weaviate':
        return ['apiKey', 'url'];
      default:
        throw new Error(`Unsupported vector database: ${vectorDb}`);
    }
  }
}
