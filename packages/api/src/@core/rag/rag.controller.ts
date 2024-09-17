import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import { ConnectionUtils } from '@@core/connections/@utils';
import { ApiPostCustomResponse } from '@@core/utils/dtos/openapi.respone.dto';
import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiOperation } from '@nestjs/swagger';
import { RagService } from './rag.service';
import { RagQueryOutput, QueryBody } from './rag.dto';

@Controller('rag')
export class RagController {
  constructor(
    private documentEmbeddingService: RagService,
    private ragService: RagService,
    private connectionUtils: ConnectionUtils,
  ) {}

  @Post('query')
  @ApiOperation({
    operationId: 'query',
    summary: 'Query using RAG Search',
    description: 'Query across your connected data sources using RAG Search',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiPostCustomResponse(RagQueryOutput)
  @ApiBody({ type: QueryBody })
  @UseGuards(ApiKeyAuthGuard)
  async queryEmbeddings(
    @Body() body: QueryBody,
    @Headers('x-connection-token') connection_token: string,
  ) {
    const { linkedUserId, remoteSource, connectionId, projectId } =
      await this.connectionUtils.getConnectionMetadataFromConnectionToken(
        connection_token,
      );
    return this.documentEmbeddingService.queryEmbeddings(
      body.query,
      body.topK,
      linkedUserId,
      projectId,
    );
  }

  /*
  @ApiOperation({
    operationId: 'listFilestorageFile',
    summary: 'List  Files',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @Post('process')
  @UseGuards(ApiKeyAuthGuard)
  async processFile(@Headers('x-connection-token') connection_token: string) {
    const { linkedUserId, remoteSource, connectionId, projectId } =
      await this.connectionUtils.getConnectionMetadataFromConnectionToken(
        connection_token,
      );
    const body = {
      id: 'ID_1',
      url: 'https://drive.google.com/file/d/1rrC1idlFpCBdF3DVzNDp1WeRZ4_mKGho/view',
      s3Key: `${projectId}/ID_1.pdf`,
      fileType: 'pdf',
    };
    return await this.ragService.queueDocumentProcessing(
      [body],
      projectId,
      linkedUserId,
    );
  }*/
}
