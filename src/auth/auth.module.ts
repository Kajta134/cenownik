import * as dotenv from 'dotenv';
dotenv.config();
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { RoleGuard } from './roles/role.guard.js';
import { UserModule } from '../user/user.module.js';
import { DiscordModule } from '../discord/discord.module.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService, RoleGuard],
  imports: [
    forwardRef(() => UserModule),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30m' },
    }),
    DiscordModule,
  ],
  exports: [AuthService, RoleGuard, JwtModule],
})
export class AuthModule {}
