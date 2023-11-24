import { Test, TestingModule } from '@nestjs/testing';
import { LinkedUsersController } from './linked-users.controller';

describe('LinkedUsersController', () => {
  let controller: LinkedUsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LinkedUsersController],
    }).compile();

    controller = module.get<LinkedUsersController>(LinkedUsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
