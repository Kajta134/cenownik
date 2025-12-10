import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../generated/prisma/enums.js';
import { RequestWithUser } from '../dto/request-with-user.dto.js';
import { ROLES_KEY } from './role.decorator.js';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (requiredRoles.length === 0) {
      return true;
    }
    const request: RequestWithUser = context.switchToHttp().getRequest();
    return (
      request.user !== undefined && requiredRoles.includes(request.user.role)
    );
  }
}
