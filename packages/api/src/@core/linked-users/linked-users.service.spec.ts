import { Test, TestingModule } from '@nestjs/testing';
import { LinkedUsersService } from './linked-users.service';

describe('LinkedUsersService', () => {
  let service: LinkedUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LinkedUsersService],
    }).compile();

    service = module.get<LinkedUsersService>(LinkedUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
