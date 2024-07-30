import { ProjectsService } from '@@core/projects/projects.service';
import { ValidateUserService } from '@@core/utils/services/validate-user.service';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ApiKeyStrategy } from './strategies/auth-header-api-key.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MailModule } from '@@core/mailer/module';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtService,
    ApiKeyStrategy,
    ConfigService,
    ProjectsService,
    ValidateUserService,
  ],
  imports: [
    PassportModule,
    MailModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  exports: [JwtService],
})
export class AuthModule {}
