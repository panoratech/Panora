// validate-user.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ValidateUserService } from '../services/validate-user.service';

@Injectable()
export class ValidateUserGuard implements CanActivate {
  constructor(private readonly validateUserService: ValidateUserService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const { id_user } = request.user;
    const project_id = request.query.project_id; // Extract project_id from the query parameters

    // Ensure project_id is provided and is a string
    if (!project_id || typeof project_id !== 'string') {
      return false;
    }

    return this.validateUserService.validate(id_user, project_id);
  }
}
