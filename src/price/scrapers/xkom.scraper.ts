import { chromium } from 'playwright';
import { PriceScraper } from '../price-scraping.service.js';

export class XkomScraper implements PriceScraper {
  canHandle(url: string): boolean {
    return url.includes('https://www.x-kom.pl');
  }
  async scrape(url: string): Promise<number | null> {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      locale: 'pl-PL',
    });

    const page = await context.newPage();

    try {
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 45000,
      });

      const price = await page
        .locator('meta[property="product:price:amount"]')
        .getAttribute('content');

      if (!price) {
        return null;
      }

      const numericPrice = parseFloat(price.replace(',', '.'));
      if (isNaN(numericPrice)) {
        return null;
      }

      return numericPrice;
    } catch (e) {
      console.warn('Scrape nieudany:', e);
      return null;
    } finally {
      await browser.close();
    }
  }
}
