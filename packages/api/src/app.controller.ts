import {
  Controller,
  Get,
  Request,
  Post,
  UseGuards,
  Body,
} from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './@core/auth/guards/local-auth.guard';
import { AuthService } from './@core/auth/auth.service';
import { JwtAuthGuard } from './@core/auth/guards/jwt-auth.guard';
import { ApiKeyAuthGuard } from './@core/auth/guards/api-key.guard';
import {
  CreateUserDto,
  LoginCredentials,
} from './@core/auth/dto/create-user.dto';
import { ApiKey } from './@core/auth/types';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private authService: AuthService,
  ) {}

  @UseGuards(ApiKeyAuthGuard)
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(ApiKeyAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('auth/register')
  async registerUser(@Body() user: CreateUserDto) {
    return this.authService.register(user);
  }

  //@UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Body() user: LoginCredentials) {
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('generate-apikey')
  async generateApiKey(
    @Request() req,
    @Body() data: { projectId: number },
  ): Promise<string> {
    const userId = req.user.userId;
    const apiKey = await this.authService.generateApiKeyForUser(
      userId,
      data.projectId,
    );
    //const apiKey = await this.authService.generateApiKey1(data.projectId);

    return apiKey;
  }
}
