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
      { header: 'Authorization', prefix: 'Bearer ' },
      true,
      async (apikey: string, done, req) => {
        try {
          const isValid = await this.authService.validateApiKey(apikey);
          if (!isValid) {
            return done(new UnauthorizedException('Invalid API Key'), null);
          }
          const projectId = await this.authService.getProjectIdForApiKey(
            apikey,
          );
          //console.log('validating api request...  : ' + req.user);
          // If the API key is valid, attach the user to the request object
          req.user = {
            ...req.user,
            id_project: projectId,
            apiKeyValidated: true,
          };

          // If valid, we now have the user info from the API key validation process
          return done(null, req.user);
        } catch (error) {
          return done(error, false);
        }
      },
    );
  }
}
