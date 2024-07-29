import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { AuthService } from '../auth.service';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionId = request.auth.sessionId;

    if (!sessionId) {
      throw new UnauthorizedException();
    }

    try {
      const session = await clerkClient.sessions.getSession(sessionId);
      if (!session)
        throw new ReferenceError(`No session found for sessionId=${sessionId}`);
      const projectId = await this.authService.extractProjectId(session.userId);
      request.projectId = projectId;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
