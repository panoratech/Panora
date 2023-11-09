import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionsController } from './connections.controller';
import { ConnectionsService } from './connections.service';

describe('ConnectionsController', () => {
  let controller: ConnectionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConnectionsController],
      providers: [ConnectionsService],
    }).compile();

    controller = module.get<ConnectionsController>(ConnectionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
