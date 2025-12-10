import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module.js';
import { AuthModule } from './auth/auth.module.js';
import { OfferModule } from './offer/offer.module.js';

@Module({
  imports: [UserModule, AuthModule, OfferModule],
})
export class AppModule {}
