import { Injectable, NotFoundException } from '@nestjs/common';

import { User } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserMetadata, userToMetadata } from './dto/user-metadata.js';
import { UserUpdateResponseDto } from './dto/user-update-response.dto.js';
import { UserUpdateDto } from './dto/update-user.dto.js';
import { DiscordService } from '../discord/discord.service.js';

@Injectable()
export class UserService {
  constructor(
    private databaseService: PrismaService,
    private readonly discordService: DiscordService,
  ) {}

  async getAllUsers(): Promise<User[]> {
    const users = await this.databaseService.user.findMany();
    return users;
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.databaseService.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

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
    updateRequest: UserUpdateDto,
  ): Promise<UserUpdateResponseDto> {
    const user = await this.findByIdOrFail(email);
    if (user === null) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    const discordActivationLink = user.discordId
      ? this.discordService.sendDiscordActivationLink()
      : null;

    const updatedUser = await this.databaseService.user.update({
      where: { email },
      data: {
        name: updateRequest.name ?? user.name,
        scraperFrequency:
          updateRequest.scraperFrequency ?? user.scraperFrequency,
        discordId: updateRequest.discordId ?? user.discordId,
      },
    });
    return {
      name: updatedUser.name,
      scraperFrequency: updatedUser.scraperFrequency,
      discordId: updatedUser.discordId ?? null,
      discordActivationLink,
    };
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
    discordId?: string,
  ): Promise<User> {
    return this.databaseService.user.create({
      data: {
        email,
        password,
        name,
        discordId,
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
