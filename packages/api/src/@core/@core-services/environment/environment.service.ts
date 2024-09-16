import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type OAuth = {
  CLIENT_ID: string;
  CLIENT_SECRET: string;
};

export type RateLimit = {
  ttl: string;
  limit: string;
};

// for providers secret it is of the form
// get{provider_name}{vertical_name}Secret
@Injectable()
export class EnvironmentService {
  constructor(private configService: ConfigService) {}

  getEnvMode(): string {
    return this.configService.get<string>('ENV');
  }
  getWebhookIngress(): string {
    return this.configService.get<string>('WEBHOOK_INGRESS');
  }
  getTunnelIngress(): string {
    return this.configService.get<string>('REDIRECT_TUNNEL_INGRESS');
  }
  getSentryDsn(): string {
    return this.configService.get<string>('SENTRY_DSN');
  }
  getDistributionMode(): string {
    return this.configService.get<string>('DISTRIBUTION');
  }
  getDatabaseURL(): string {
    return this.configService.get<string>('DATABASE_URL');
  }
  getPanoraBaseUrl(): string {
    return this.configService.get<string>('PANORA_BASE_API_URL');
  }
  getRedisHost(): string {
    return this.configService.get<string>('REDIS_HOST');
  }

  getCryptoKey(): string {
    return this.configService.get<string>('ENCRYPT_CRYPTO_SECRET_KEY');
  }

  getPosthogHost(): string {
    return this.configService.get<string>('POSTHOG_HOST');
  }

  getPosthogKey(): string {
    return this.configService.get<string>('POSTHOG_KEY');
  }

  getPhTelemetry(): string {
    return this.configService.get<string>('PH_TELEMETRY');
  }

  getThrottleConfig(): RateLimit {
    return {
      ttl: this.configService.get<string>('THROTTLER_TTL'),
      limit: this.configService.get<string>('THROTTLER_LIMIT'),
    };
  }

  getChromaCreds() {
    return {
      url: this.configService.get<string>('CHROMADB_URL'),
      collectionName: this.configService.get<string>(
        'CHROMADB_COLLECTION_NAME',
      ),
    };
  }

  getMilvusCreds() {
    return {
      address: this.configService.get<string>('MILVUS_ADDRESS'),
      collectionName: this.configService.get<string>('MILVUS_COLLECTION_NAME'),
    };
  }
  getPineconeCreds() {
    return {
      apiKey: this.configService.get<string>('PINECONE_API_KEY'),
      indexName: this.configService.get<string>('PINECONE_INDEX_NAME'),
    };
  }

  getWeaviateCreds() {
    return {
      url: this.configService.get<string>('WEAVIATE_URL'),
      apiKey: this.configService.get<string>('WEAVIATE_API_KEY'),
      className: this.configService.get<string>('WEAVIATE_CLASS_NAME'),
    };
  }

  getTurboPufferApiKey(): string {
    return this.configService.get<string>('TURBOPUFFER_API_KEY');
  }

  getQdrantCreds() {
    return {
      baseUrl: this.configService.get<string>('QDRANT_BASE_URL'),
      apiKey: this.configService.get<string>('QDRANT_API_KEY'),
      collectionName: this.configService.get<string>('QDRANT_COLLECTION_NAME'),
    };
  }

  getAwsCredentials() {
    return {
      region: this.configService.get<string>('AWS_REGION'),
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
    };
  }
  getMinioCredentials() {
    return {
      accessKeyId: this.configService.get<string>('MINIO_ROOT_USER'),
      secretAccessKey: this.configService.get<string>('MINIO_ROOT_PASSWORD'),
    };
  }

  getOpenAIApiKey(): string {
    return this.configService.get<string>('OPENAI_API_KEY');
  }

  getCohereApiKey(): string {
    return this.configService.get<string>('COHERE_API_KEY');
  }

  getJinaApiKey(): string {
    return this.configService.get<string>('JINA_API_KEY');
  }

  getUnstructuredCreds() {
    return {
      apiKey: this.configService.get<string>('UNSTRUCTURED_API_KEY'),
      apiUrl: this.configService.get<string>('UNSTRUCTURED_API_URL'),
    };
  }
}
