import { Request } from 'express';

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RequestWithUser } from './dto/request-with-user.dto.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request: RequestWithUser = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (token === undefined) {
      throw new UnauthorizedException('Missing token');
    }
    try {
      request.user = this.authService.validateToken(token);
    } catch (error) {
      throw new UnauthorizedException((error as Error).message);
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
