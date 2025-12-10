/* eslint-disable @typescript-eslint/unbound-method */
import { jest } from '@jest/globals';
import { AuthService } from './auth.service.js';
import { UserService } from 'src/user/user.service.js';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../generated/prisma/enums.js';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { User } from '../generated/prisma/client.js';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    userService = {
      findOne: jest.fn(),
      createUser: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    jwtService = {
      verify: jest.fn(),
      sign: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    authService = new AuthService(
      userService as unknown as UserService,
      jwtService as unknown as JwtService,
    );
  });

  describe('validateToken', () => {
    it('returns user metadata when token is valid', () => {
      const metadata = { email: 'test@example.com', role: Role.USER };
      jwtService.verify.mockReturnValue(metadata);

      const result = authService.validateToken('valid-token');

      expect(jwtService.verify).toHaveBeenCalledWith('valid-token');
      expect(result).toEqual(metadata);
    });

    it('throws UnauthorizedException when token is invalid', () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid');
      });

      expect(() => authService.validateToken('bad-token')).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('signIn', () => {
    const user = {
      email: 'user@example.com',
      password: 'secret',
      role: Role.USER,
      name: 'User',
      isActive: true,
    };

    it('returns token and user data for valid credentials', async () => {
      userService.findOne.mockResolvedValue(user as User);
      jwtService.sign.mockReturnValue('signed-token');

      const result = await authService.signIn('user@example.com', 'secret');

      expect(userService.findOne).toHaveBeenCalledWith('user@example.com');
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        role: user.role,
      });
      expect(result).toEqual({
        token: 'signed-token',
        email: user.email,
        name: user.name,
        role: user.role,
      });
    });

    it('throws UnauthorizedException when user not found', async () => {
      userService.findOne.mockResolvedValue(null);

      await expect(
        authService.signIn('missing@example.com', 'secret'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when password is wrong', async () => {
      userService.findOne.mockResolvedValue({
        ...user,
        password: 'other',
      } as User);

      await expect(
        authService.signIn('user@example.com', 'secret'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when user is inactive', async () => {
      userService.findOne.mockResolvedValue({
        ...user,
        isActive: false,
      } as User);

      await expect(
        authService.signIn('user@example.com', 'secret'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('creates user when email is free', async () => {
      userService.findOne.mockResolvedValue(null);
      userService.createUser.mockResolvedValue({
        email: 'new@example.com',
      } as User);

      const result = await authService.register(
        'new@example.com',
        'pass',
        'Name',
      );

      expect(userService.findOne).toHaveBeenCalledWith('new@example.com');
      expect(userService.createUser).toHaveBeenCalledWith(
        'new@example.com',
        'pass',
        'Name',
      );
      expect(result).toEqual({ email: 'new@example.com' });
    });

    it('throws ConflictException when email already exists', async () => {
      userService.findOne.mockResolvedValue({
        email: 'exists@example.com',
      } as User);

      await expect(
        authService.register('exists@example.com', 'pass', 'Name'),
      ).rejects.toThrow(ConflictException);
    });
  });
});
