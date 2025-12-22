/* eslint-disable @typescript-eslint/unbound-method */
import { jest } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';
import { Role } from '../generated/prisma/enums.js';
import { UserUpdateResponseDto } from './dto/user-update-response.dto.js';
import { User } from '../generated/prisma/browser.js';

describe('UserController', () => {
  let controller: UserController;
  const userService: jest.Mocked<UserService> = {
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
    updateUserData: jest.fn(),
  } as unknown as jest.Mocked<UserService>;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UserController(userService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('calls userService.updateUserData when the same user updates own data', async () => {
    userService.updateUserData.mockResolvedValue({} as UserUpdateResponseDto);
    const req = { user: { email: 'user@example.com', role: Role.USER } };
    const result = await controller.updateUserData('user@example.com', req, {
      name: 'New Name',
    } as UserUpdateResponseDto);
    expect(userService.updateUserData as jest.Mock).toHaveBeenCalledWith(
      'user@example.com',
      { name: 'New Name' } as UserUpdateResponseDto,
    );
    expect(result).toEqual({});
  });

  it('allows ADMIN to update other user data', async () => {
    userService.updateUserData.mockResolvedValue({
      updated: true,
    } as unknown as UserUpdateResponseDto);
    const req = { user: { email: 'admin@example.com', role: Role.ADMIN } };
    const result = await controller.updateUserData('user@example.com', req, {
      name: 'Another Name',
    } as UserUpdateResponseDto);
    expect(userService.updateUserData as jest.Mock).toHaveBeenCalledWith(
      'user@example.com',
      { name: 'Another Name' } as UserUpdateResponseDto,
    );
    expect(result).toEqual({ updated: true });
  });

  it('throws UnauthorizedException when non-admin updates other user data', async () => {
    const req = { user: { email: 'other@example.com', role: Role.USER } };
    await expect(
      controller.updateUserData('user@example.com', req, {
        name: 'Bad Attempt',
      } as UserUpdateResponseDto),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(userService.updateUserData as jest.Mock).not.toHaveBeenCalled();
  });

  it('calls userService.getAllUsers', async () => {
    userService.getAllUsers.mockResolvedValue([]);
    const result = await controller.getAllUsers();
    expect(userService.getAllUsers as jest.Mock).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('calls userService.getUserById when the same user accesses own data', async () => {
    const mockUser = { id: 1, email: 'example@example.com' };
    userService.getUserById.mockResolvedValue(mockUser as User);
    const req = { user: { email: 'example@example.com', role: Role.USER } };
    const result = await controller.getUserById('1', req);
    expect(userService.getUserById as jest.Mock).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockUser);
  });
  it('allows ADMIN to access other user data', async () => {
    const mockUser = { id: 2, email: 'other@example.com' };
    userService.getUserById.mockResolvedValue(mockUser as User);
    const req = { user: { email: 'admin@example.com', role: Role.ADMIN } };
    const result = await controller.getUserById('2', req);
    expect(userService.getUserById as jest.Mock).toHaveBeenCalledWith(2);
    expect(result).toEqual(mockUser);
  });

  it('throws UnauthorizedException when non-admin accesses other user data', async () => {
    const mockUser = { id: 3, email: 'other@example.com' };
    userService.getUserById.mockResolvedValue(mockUser as User);
    const req = { user: { email: 'user@example.com', role: Role.USER } };
    await expect(controller.getUserById('3', req)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(userService.getUserById as jest.Mock).toHaveBeenCalledWith(3);
  });
});
