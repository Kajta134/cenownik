import { jest } from '@jest/globals';
import type { ExecutionContext } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { RequestWithUser } from './dto/request-with-user.dto.js';
import { Role } from '../generated/prisma/enums.js';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: AuthService;

  beforeEach(() => {
    authService = {
      validateToken: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;
    guard = new AuthGuard(authService);
  });

  const createMockContext = (authorization?: string): ExecutionContext => {
    const request: Partial<RequestWithUser> = {
      headers: authorization == null ? {} : { authorization },
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  it('should allow access when token is valid', () => {
    const mockUser = { id: 1, email: 'test@example.com', role: Role.USER };
    jest.spyOn(authService, 'validateToken').mockReturnValue(mockUser as never);

    const context = createMockContext('Bearer valid-token');
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const result = guard.canActivate(context);
    expect(result).toBe(true);
    expect(request.user).toEqual(mockUser);
  });

  it('should throw UnauthorizedException if token is missing', () => {
    const context = createMockContext();
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if token is invalid', () => {
    (authService.validateToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedException('Invalid token');
    });

    const context = createMockContext('Bearer invalid-token');
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});
