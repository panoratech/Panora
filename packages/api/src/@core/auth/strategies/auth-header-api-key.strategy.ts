import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'api-key',
) {
  constructor(private authService: AuthService) {
    super(
      { header: 'Authorization', prefix: '' },
      true,
      async (apikey: string, done, req) => {
        try {
          const userId = req.user.userId;
          //const projectId = req.user.projectId;
          // Ensure both userId and projectId are available
          if (!userId) {
            return done(
              new UnauthorizedException('User ID not provided'),
              null,
            );
          }

          const isValid = await this.authService.validateApiKey(apikey, userId);
          if (!isValid) {
            return done(new UnauthorizedException('Invalid API Key'), null);
          }

          // If the API key is valid, attach the user to the request object
          req.user = { ...req.user, apiKeyValidated: true };

          // If valid, we now have the user info from the API key validation process
          return done(null, req.user);
        } catch (error) {
          return done(error, false);
        }
      },
    );
  }
}
