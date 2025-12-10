import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service.js';
import { AuthService } from '../auth/auth.service.js';
import { RoleGuard } from '../auth/roles/role.guard.js';
import { AuthModule } from '../auth/auth.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { UserController } from './user.controller.js';

@Module({
  providers: [UserService, AuthService, RoleGuard],
  exports: [UserService, AuthModule],
  imports: [PrismaModule, forwardRef(() => AuthModule)],
  controllers: [UserController],
})
export class UserModule {}
