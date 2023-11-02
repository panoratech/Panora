import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy) {
  constructor(private authService: AuthService) {
    super(
      { header: 'Authorization', prefix: '' },
      true,
      async (apikey: string, done) => {
        try {
          const user = await this.authService.validateApiKey1(apikey);
          if (!user) {
            return done(new UnauthorizedException('Invalid API Key'), false);
          }
          // If valid, we now have the user info from the API key validation process
          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      },
    );
  }
}
