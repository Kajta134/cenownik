import { chromium } from 'playwright';
import { PriceScraper } from './scraper.service.js';

export class XkomScraper implements PriceScraper {
  canHandle(url: string): boolean {
    return url.includes('https://www.x-kom.pl');
  }
  async scrape(url: string): Promise<number | null> {
    const browser = await chromium.launch({ headless: true });

    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      locale: 'en-US',
    });

    const page = await context.newPage();

    await page
      .goto(url, {
        waitUntil: 'networkidle',
        timeout: 45000,
      })
      .catch(async (e) => {
        console.error('Błąd podczas ładowania strony:', e);
        await browser.close();
        return null;
      });

    await page
      .waitForSelector('meta[property="product:price:amount"]', {
        timeout: 10000,
      })
      .catch(async () => {
        console.warn('Nie znaleziono selektora ceny na stronie X-Kom.');
        await browser.close();
        return null;
      });

    const price = await page
      .locator('meta[property="product:price:amount"]')
      .getAttribute('content');
    await browser.close();

    if (!price) {
      throw new Error('Pod tym adresem nie ma ceny');
    }
    const numericPrice = parseFloat(price.replace(',', '.'));
    if (isNaN(numericPrice)) {
      throw new Error('Nie udało się przekonwertować ceny na liczbę.');
    }
    return numericPrice;
  }
}
