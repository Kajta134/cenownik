import { Module } from '@nestjs/common';
import { ScrapperService } from './scraper.service.js';
import { PrismaModule } from 'src/prisma/prisma.module.js';

@Module({
  providers: [ScrapperService],
  imports: [PrismaModule],
  exports: [ScrapperService],
})
export class ScraperModule {}
