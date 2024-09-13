import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { S3Service } from '@@core/s3/s3.service';
import { Module } from '@nestjs/common';
import { DocumentSplitterService } from './chunking/chunking.service';
import { ProcessDocumentProcessor } from './document.processor';
import { EmbeddingService } from './embedding/embedding.service';
import { DocumentLoaderService } from './loader/loader.service';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { ChromaDBService } from './vecdb/chromadb/chromadb.service';
import { MilvusService } from './vecdb/milvus/milvus.service';
import { PineconeService } from './vecdb/pinecone/pinecone.service';
import { TurboPufferService } from './vecdb/turbopuffer/turbopuffer.service';
import { VectorDatabaseService } from './vecdb/vecdb.service';
import { WeaviateService } from './vecdb/weaviate/weaviate.service';
import { QdrantDBService } from './vecdb/qdrant/qdrant.service';
import { FileModule } from '@filestorage/file/file.module';
import { VectorDbCredentialsService } from './vecdb/vecdb.credentials.service';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { EmbeddingCredentialsService } from './embedding/embedding.credentials.service';

@Module({
  imports: [FileModule],
  controllers: [RagController],
  providers: [
    EnvironmentService,
    VectorDatabaseService,
    PineconeService,
    WeaviateService,
    TurboPufferService,
    ChromaDBService,
    QdrantDBService,
    MilvusService,
    RagService,
    ProcessDocumentProcessor,
    S3Service,
    DocumentLoaderService,
    DocumentSplitterService,
    EmbeddingService,
    VectorDatabaseService,
    EmbeddingCredentialsService,
    ConnectionsStrategiesService,
    VectorDbCredentialsService,
  ],
  exports: [
    RagService,
    VectorDatabaseService,
    ProcessDocumentProcessor,
    S3Service,
    DocumentLoaderService,
    DocumentSplitterService,
    EmbeddingService,
    PineconeService,
    WeaviateService,
    TurboPufferService,
    ChromaDBService,
    QdrantDBService,
    MilvusService,
    ConnectionsStrategiesService,
    VectorDbCredentialsService,
  ],
})
export class RagModule {}
