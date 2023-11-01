import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from './users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { jwtConstants } from './utils/constants';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersService } from './users/users.service';

@Module({
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    UsersService,
    JwtService,
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
