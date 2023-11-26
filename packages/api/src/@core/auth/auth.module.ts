import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ApiKeyStrategy } from './strategies/auth-header-api-key.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../logger/logger.service';

@Module({
  providers: [
    AuthService,
    JwtStrategy,
    JwtService,
    ApiKeyStrategy,
    PrismaService,
    ConfigService,
    LoggerService,
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
