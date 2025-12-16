import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { Role } from '../generated/prisma/client.js';
import { UserMetadata } from '../user/dto/user-metadata.js';
import { UserService } from '../user/user.service.js';
import { LoginResponseDto } from './dto/login-response.dto.js';
import { DiscordService } from '../discord/discord.service.js';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly discordService: DiscordService,
  ) {}

  validateToken(token: string): UserMetadata {
    try {
      return this.jwtService.verify<UserMetadata>(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private generateToken(email: string, role: Role): string {
    const userMetadata: UserMetadata = { email, role };
    return this.jwtService.sign(userMetadata);
  }

  async signIn(email: string, password: string): Promise<LoginResponseDto> {
    const user = await this.usersService.findOne(email);
    if (user == null || !(password === user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Account is not activated');
    }
    const discordActivationLink = user.discordId
      ? null
      : this.discordService.sendDiscordActivationLink();

    return {
      token: this.generateToken(user.email, user.role),
      email: user.email,
      name: user.name,
      role: user.role,
      discordActivationLink,
    };
  }

  async register(
    email: string,
    password: string,
    name: string,
    discordId?: string,
  ): Promise<{ email: string }> {
    const existingUser = await this.usersService.findOne(email);
    if (existingUser != null) {
      throw new ConflictException('User with this email already exists');
    }

    const newUser = await this.usersService.createUser(
      email,
      password,
      name,
      discordId,
    );

    return {
      email: newUser.email,
    };
  }
}
