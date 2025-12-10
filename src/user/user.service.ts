import { Injectable, NotFoundException } from '@nestjs/common';

import { User } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserMetadata, userToMetadata } from './dto/user-metadata.js';
import { UserUpdateResponseDto } from './dto/user-update-response.dto.js';

@Injectable()
export class UserService {
  constructor(private databaseService: PrismaService) {}

  async findOne(email: string): Promise<User | null> {
    return this.databaseService.user.findUnique({ where: { email } });
  }

  async findMetadataOrFail(email: string): Promise<UserMetadata> {
    const user = await this.findByIdOrFail(email);
    if (user === null) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return userToMetadata(user);
  }

  async updateUserData(
    email: string,
    newName: string | null | undefined,
  ): Promise<UserUpdateResponseDto> {
    const user = await this.findByIdOrFail(email);
    if (user === null) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    if (newName !== undefined && newName !== null) {
      user.name = newName;
    }

    return await this.mergeUser(user);
  }

  private async mergeUser(user: User): Promise<User> {
    return await this.databaseService.user.update({
      where: { email: user.email },
      data: {
        name: user.name,
        password: user.password,
        role: user.role,
      },
    });
  }

  private async findByIdOrFail(email: string): Promise<User | null> {
    const found = await this.databaseService.user.findUnique({
      where: { email },
    });
    if (found === null) {
      return null;
    }
    return found;
  }

  async createUser(
    email: string,
    password: string,
    name: string,
  ): Promise<User> {
    return this.databaseService.user.create({
      data: {
        email,
        password,
        name,
        isActive: true,
      },
    });
  }

  async activateUser(email: string): Promise<void> {
    const user = await this.findByIdOrFail(email);
    if (user === null) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    if (user.isActive) {
      return;
    }
    await this.databaseService.user.update({
      where: { email },
      data: { isActive: true },
    });
  }
}
