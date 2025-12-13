import { User } from '../../generated/prisma/client.js';

export interface UserUpdateResponseDto {
  name: string | null;
  scraperFrequency: number;
}

export function userToUserUpdateDto(user: User): UserUpdateResponseDto {
  return {
    name: user.name,
    scraperFrequency: user.scraperFrequency,
  };
}
