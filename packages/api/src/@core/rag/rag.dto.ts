import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class RagQueryOutput {
  @ApiProperty({
    type: String,
    example: '\nDate : 06/07/2023',
    nullable: false,
    description: 'The chunk which matches the embed query',
  })
  @IsString()
  chunk: string;

  @ApiProperty({
    type: Object,
    example: {
      blobType: '',
      text: 'ATTESTATION',
    },
    additionalProperties: true,
    nullable: true,
    description: 'The metadata tied to the chunk',
  })
  metadata: any;

  @ApiProperty({
    type: Number,
    example: 0.87,
    nullable: true,
    description: 'The score',
  })
  @IsNumber()
  score: number;

  @ApiProperty({
    type: [Number],
    example: [
      -0.00442447886, -0.00116857514, 0.00869117491, -0.0361584462,
      -0.00220073434, 0.00946036354, -0.0101112155,
    ],
    nullable: true,
    description: 'The embedding of the relevant chunk',
  })
  embedding: number[];
}

export class QueryBody {
  @ApiProperty({
    type: String,
    example: 'When does Panora incorporated?',
    nullable: false,
    description: 'The query you want to received embeddings and chunks for',
  })
  @IsString()
  query: string;

  @ApiPropertyOptional({
    type: Number,
    example: '3',
    nullable: true,
    description: 'The number of most appropriate documents for your query.',
  })
  @IsNumber()
  topK?: number;
}
