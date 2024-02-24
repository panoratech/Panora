import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { StytchService } from '../stytch/stytch.service';

@Injectable()
export class StytchGuard implements CanActivate {
  constructor(private readonly stytchService: StytchService) {}

  canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    return this.validateSession(request.cookies['stytch_session']);
  }

  async validateSession(session_token: string) {
    try {
      await this.stytchService.sessions.authenticate({
        session_token,
      });
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
