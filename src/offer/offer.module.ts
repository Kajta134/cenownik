import { Module } from '@nestjs/common';
import { OfferController } from './offer.controller.js';
import { OfferService } from './offer.service.js';
import { PrismaModule } from 'src/prisma/prisma.module.js';

@Module({
  controllers: [OfferController],
  providers: [OfferService],
  imports: [PrismaModule],
})
export class OfferModule {}
