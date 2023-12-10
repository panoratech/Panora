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
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(AuthController.name);
  }

  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201 })
  @Post('register')
  async registerUser(@Body() user: CreateUserDto) {
    return this.authService.register(user);
  }

  @ApiBody({ type: LoginCredentials })
  @ApiResponse({ status: 201 })
  @Post('login')
  async login(@Body() user: LoginCredentials) {
    return this.authService.login(user);
  }

  @ApiResponse({ status: 200 })
  @Get('users')
  async users() {
    return this.authService.getUsers();
  }

  @ApiResponse({ status: 200 })
  @Get('api-keys')
  async apiKeys() {
    return this.authService.getApiKeys();
  }

  @ApiBody({})
  @ApiResponse({ status: 201 })
  @UseGuards(JwtAuthGuard)
  @Post('generate-apikey')
  async generateApiKey(
    @Request() req,
    @Body() data: { projectId: number },
  ): Promise<{ api_key: string }> {
    const userId = req.user.userId;
    this.logger.log('user id is ' + userId);
    return this.authService.generateApiKeyForUser(userId, data.projectId);
  }
}
