import {
  Controller,
  Request,
  Post,
  Body,
  Get,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto, LoginCredentials } from './dto/create-user.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoggerService } from '@@core/logger/logger.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private logger: LoggerService,
  ) {}

  @Post('register')
  async registerUser(@Body() user: CreateUserDto) {
    return this.authService.register(user);
  }

  @Post('login')
  async login(@Body() user: LoginCredentials) {
    return this.authService.login(user);
  }

  @Get('users')
  async users() {
    return this.authService.getUsers();
  }

  @Get('api-keys')
  async apiKeys() {
    return this.authService.getApiKeys();
  }

  @UseGuards(JwtAuthGuard)
  @Post('generate-apikey')
  async generateApiKey(
    @Request() req,
    @Body() data: { projectId: number },
  ): Promise<{ api_key: string }> {
    const userId = req.user.userId;
    this.logger.log('user id is ' + userId);
    return await this.authService.generateApiKeyForUser(userId, data.projectId);
  }
}
