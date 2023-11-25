import { Test, TestingModule } from '@nestjs/testing';
import { FieldMappingService } from './field-mapping.service';

describe('FieldMappingService', () => {
  let service: FieldMappingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FieldMappingService],
    }).compile();

    service = module.get<FieldMappingService>(FieldMappingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
