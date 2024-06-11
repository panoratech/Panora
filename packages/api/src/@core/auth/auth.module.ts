import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ApiKeyStrategy } from './strategies/auth-header-api-key.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@@core/logger/logger.service';
import { AuthController } from './auth.controller';
import { ValidateUserService } from '@@core/utils/services/validateUser.service';
import { ProjectsService } from '@@core/projects/projects.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtService,
    ApiKeyStrategy,
    PrismaService,
    ConfigService,
    ProjectsService,
    LoggerService,
    ValidateUserService,
  ],
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  exports: [PrismaService, JwtService],
})
export class AuthModule {}
