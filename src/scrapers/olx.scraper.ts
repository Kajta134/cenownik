import { chromium } from 'playwright';
import { PriceScraper } from './scraper.service.js';

export class OlxScraper implements PriceScraper {
  canHandle(url: string): boolean {
    return url.includes('https://www.olx');
  }

  async scrape(url: string): Promise<number | null> {
    const browser = await chromium.launch({
      headless: true,
    });

    const page = await browser.newPage({
      locale: 'pl-PL',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    });

    await page
      .goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      })
      .catch(async (e) => {
        console.error('Błąd podczas ładowania strony:', e);
        await browser.close();
        return null;
      });

    const priceText = await page
      .locator('[data-testid="ad-price"], [data-testid="ad-price-container"]')
      .first()
      .innerText({ timeout: 15000 })
      .catch(async () => {
        console.warn('Nie znaleziono selektora ceny na stronie OLX.');
        await browser.close();
        return null;
      });

    await browser.close();

    if (!priceText) {
      return null;
    }

    const price = Number(
      priceText.replace(/\s/g, '').replace('zł', '').replace(',', '.'),
    );

    if (isNaN(price)) {
      throw new Error(`Nieprawidłowa cena: ${priceText}`);
    }

    return price;
  }
}
