import { User } from '../../generated/prisma/client.js';

export interface UserUpdateResponseDto {
  name: string | null;
}

export function userToUserUpdateDto(user: User): UserUpdateResponseDto {
  return {
    name: user.name,
  };
}
