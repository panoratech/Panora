import { Test, TestingModule } from '@nestjs/testing';
import { FieldMappingController } from './field-mapping.controller';

describe('FieldMappingController', () => {
  let controller: FieldMappingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FieldMappingController],
    }).compile();

    controller = module.get<FieldMappingController>(FieldMappingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
