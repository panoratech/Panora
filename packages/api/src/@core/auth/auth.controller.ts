import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoggerService } from '@@core/logger/logger.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiKeyDto } from './dto/api-key.dto';
import { LoginDto } from './dto/login.dto';
import { ValidateUserGuard } from '@@core/utils/guards/validate-user.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(AuthController.name);
  }

  @ApiOperation({ operationId: 'signUp', summary: 'Register' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201 })
  @Post('register')
  async registerUser(@Body() user: CreateUserDto) {
    return this.authService.register(user);
  }

  @ApiOperation({ operationId: 'createUser', summary: 'Create User' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201 })
  @Post('users/create')
  async createUser(@Body() user: CreateUserDto) {
    return this.authService.createUser(user);
  }

  @ApiOperation({ operationId: 'signIn', summary: 'Log In' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 201 })
  @Post('login')
  async login(@Body() user: LoginDto) {
    return this.authService.login(user);
  }

  // todo: admin only
  @ApiOperation({ operationId: 'getUsers', summary: 'Get users' })
  @ApiResponse({ status: 200 })
  @Get('users')
  async users() {
    return this.authService.getUsers();
  }

  @ApiResponse({ status: 201 })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.authService.verifyUser(req.user);
  }

  @ApiOperation({ operationId: 'getApiKeys', summary: 'Retrieve API Keys' })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAuthGuard, ValidateUserGuard)
  @Get('api-keys')
  async getApiKeys(
    @Request() req: any,
    @Query('project_id') project_id: string,
  ) {
    const id_user = req.user.id_user; // Extracted from JWT payload
    return this.authService.getApiKeys(id_user, project_id);
  }

  @ApiOperation({ operationId: 'generateApiKey', summary: 'Create API Key' })
  @ApiBody({ type: ApiKeyDto })
  @ApiResponse({ status: 201 })
  @UseGuards(JwtAuthGuard)
  @Post('generate-apikey')
  async generateApiKey(@Body() data: ApiKeyDto): Promise<{ api_key: string }> {
    return this.authService.generateApiKeyForUser(
      data.userId,
      data.projectId,
      data.keyName,
    );
  }
}
