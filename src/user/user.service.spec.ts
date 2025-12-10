/* eslint-disable @typescript-eslint/unbound-method */
import { jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { UserService } from './user.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Role } from '../generated/prisma/enums.js';
import { userToMetadata } from './dto/user-metadata.js';
import { User } from 'src/generated/prisma/client.js';

describe('UserService', () => {
  let service: UserService;
  let prisma: jest.Mocked<PrismaService>;

  const mockUser = {
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    role: Role.USER,
    isActive: true,
  } as User;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaService>;

    service = new UserService(prisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return user if found', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.findOne(mockUser.email);
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
    });

    it('should return null if not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const result = await service.findOne(mockUser.email);
      expect(result).toBeNull();
    });
  });

  describe('findMetadataOrFail', () => {
    it('should return user metadata if found', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.findMetadataOrFail(mockUser.email);
      expect(result).toEqual(userToMetadata(mockUser));
    });

    it('should throw NotFoundException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.findMetadataOrFail(mockUser.email)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateUserData', () => {
    it('should update user name if provided', async () => {
      const updatedUser = { ...mockUser, name: 'New Name' };
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateUserData(mockUser.email, 'New Name');
      expect(result).toEqual(updatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { email: mockUser.email },
        data: {
          name: 'New Name',
          password: mockUser.password,
          role: mockUser.role,
        },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.updateUserData(mockUser.email, 'New Name'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should keep old name if newName is null or undefined', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue(mockUser);

      const result1 = await service.updateUserData(mockUser.email, null);
      const result2 = await service.updateUserData(mockUser.email, undefined);

      expect(result1.name).toEqual(mockUser.name);
      expect(result2.name).toEqual(mockUser.name);
    });
  });

  describe('createUser', () => {
    it('should create and return new user', async () => {
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await service.createUser(
        mockUser.email,
        mockUser.password,
        mockUser.name,
      );

      expect(result).toEqual(mockUser);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: mockUser.email,
          password: mockUser.password,
          name: mockUser.name,
          isActive: true,
        },
      });
    });
  });

  describe('activateUser', () => {
    it('should update isActive to true if user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      prisma.user.findUnique.mockResolvedValue(inactiveUser);
      prisma.user.update.mockResolvedValue({
        ...inactiveUser,
        isActive: true,
      });

      await service.activateUser(mockUser.email);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { email: mockUser.email },
        data: { isActive: true },
      });
    });

    it('should do nothing if user is already active', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await service.activateUser(mockUser.email);

      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.activateUser(mockUser.email)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
