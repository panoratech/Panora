import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { AuthService } from '../auth.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'api-key',
) {
  constructor(private authService: AuthService) {
    super(
      { header: 'Authorization', prefix: 'Bearer ' },
      true,
      async (apikey: string, done, req) => {
        try {
          const isValid = await this.authService.validateApiKey(apikey);
          if (!isValid) {
            return done(new UnauthorizedException('Invalid API Key'), null);
          }
          req.user = { ...req.user, apiKeyValidated: true };
          return done(null, req.user);
        } catch (error) {
          if (error instanceof UnauthorizedException) {
            return done(error, false);
          }
          return done(new UnauthorizedException('Invalid API Key'), null);
        }
      },
    );
  }
}