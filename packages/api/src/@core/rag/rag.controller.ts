import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { RagService } from './rag.service';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiHeader,
  //ApiKeyAuth,
} from '@nestjs/swagger';
import { ConnectionUtils } from '@@core/connections/@utils';

@Controller('rag')
export class RagController {
  constructor(
    private documentEmbeddingService: RagService,
    private ragService: RagService,
    private connectionUtils: ConnectionUtils,
  ) {}

  @Post('query')
  @UseGuards(ApiKeyAuthGuard)
  async queryEmbeddings(@Body() body: { query: string; topK?: number }) {
    return this.documentEmbeddingService.queryEmbeddings(body.query, body.topK);
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
