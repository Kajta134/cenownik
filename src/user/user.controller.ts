import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { UserMetadata } from './dto/user-metadata.js';
import { UserUpdateResponseDto } from './dto/user-update-response.dto.js';
import { UserUpdateDto } from './dto/update-user.dto.js';
import { Role } from '../generated/prisma/enums.js';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({
    summary: 'Update the personal data of a user',
  })
  @ApiResponse({
    status: 200,
    description: 'Field(s) updated',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch(':email')
  async updateUserData(
    @Param('email') email: string,
    @Request()
    request: {
      user: UserMetadata;
    },
    @Body() updateRequest: UserUpdateDto,
  ): Promise<UserUpdateResponseDto> {
    if (request.user.email !== email && request.user.role !== Role.ADMIN) {
      throw new UnauthorizedException('You can only update your own data');
    }
    return this.userService.updateUserData(email, updateRequest.name);
  }
}
