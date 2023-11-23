import {
  Controller,
  Get,
  Request,
  Post,
  UseGuards,
  Body,
} from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './@core/auth/auth.service';
import { JwtAuthGuard } from './@core/auth/guards/jwt-auth.guard';
import { ApiKeyAuthGuard } from './@core/auth/guards/api-key.guard';
import {
  CreateUserDto,
  LoginCredentials,
} from './@core/auth/dto/create-user.dto';
import { LoggerService } from './@core/logger/logger.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private authService: AuthService,
    private logger: LoggerService,
  ) {}

  @UseGuards(ApiKeyAuthGuard)
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('auth/register')
  async registerUser(@Body() user: CreateUserDto) {
    return this.authService.register(user);
  }

  @Post('auth/login')
  async login(@Body() user: LoginCredentials) {
    return this.authService.login(user);
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
