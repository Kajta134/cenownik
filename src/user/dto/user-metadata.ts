import { Role, User } from '../../generated/prisma/client.js';

export interface UserMetadata {
  email: string;
  role: Role;
}

export function userToMetadata(user: User) {
  return {
    email: user.email,
    role: user.role,
  };
}
