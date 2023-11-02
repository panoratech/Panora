import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from './users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { jwtConstants } from './utils/constants';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersService } from './users/users.service';
import { ApiKeyStrategy } from './strategies/auth-header-api-key.strategy';

@Module({
  providers: [
    AuthService,
    JwtStrategy,
    UsersService,
    JwtService,
    ApiKeyStrategy,
  ],
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  exports: [UsersService, JwtService],
})
export class AuthModule {}
