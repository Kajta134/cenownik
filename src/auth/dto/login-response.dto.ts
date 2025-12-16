import { Role } from '../../generated/prisma/client.js';

export interface LoginResponseDto {
  token: string;

  email: string;

  name: string;

  role: Role;

  discordActivationLink: string | null;
}
