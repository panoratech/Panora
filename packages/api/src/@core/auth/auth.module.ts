import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { jwtConstants } from './utils/constants';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ApiKeyStrategy } from './strategies/auth-header-api-key.strategy';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [
    AuthService,
    JwtStrategy,
    JwtService,
    ApiKeyStrategy,
    PrismaService,
  ],
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  exports: [PrismaService, JwtService],
})
export class AuthModule {}
