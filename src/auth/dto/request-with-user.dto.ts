import type { Request } from 'express';
import { UserMetadata } from '../../user/dto/user-metadata.js';

export interface RequestWithUser extends Request {
  user?: UserMetadata;
}
