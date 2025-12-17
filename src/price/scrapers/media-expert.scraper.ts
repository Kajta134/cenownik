import fetch from 'node-fetch';
import { chromium } from 'playwright';
import { PriceScraper } from '../price-scraping.service.js';

type MediaExpertProductState = {
  ['Product:ProductShowService.state']?: {
    offer?: {
      flags?: {
        price_with_code?: boolean;
      };
      promotionPricesSalesChannel?: {
        app?: {
          _for_action_price?: {
            code_price?: {
              amount?: string;
            };
          };
        };
      };
      price_gross?: string;
    };
  };
};

export class MediaExpertScraper implements PriceScraper {
  canHandle(url: string): boolean {
    return url.includes('https://www.mediaexpert');
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
    if (!page) {
      console.warn('Strona nie została poprawnie załadowana.');
      await browser.close();
      return null;
    }
    const sparkId = await page.locator('#state').innerText({ timeout: 15000 });
    if (!sparkId) {
      console.warn('Nie znaleziono Spark ID na stronie produktu.');
      await browser.close();
      return null;
    }
    await browser.close();

    const jsonUrl = `https://www.mediaexpert.pl/spark-state/${sparkId}`;
    const jsonResult = await fetch(jsonUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'application/json',
      },
    });

    if (!jsonResult.ok) {
      throw new Error(
        `Błąd podczas pobierania danych JSON: ${jsonResult.statusText}`,
      );
    }

    const buffer = await jsonResult.arrayBuffer();
    const text = new TextDecoder('utf-8').decode(buffer);
    const jsonData: MediaExpertProductState = JSON.parse(
      text,
    ) as MediaExpertProductState;

    const priceWithCode: boolean =
      jsonData['Product:ProductShowService.state']?.offer?.flags
        ?.price_with_code ?? false;

    let priceString: string | undefined;
    if (priceWithCode) {
      priceString =
        jsonData['Product:ProductShowService.state']?.offer
          ?.promotionPricesSalesChannel?.app?._for_action_price?.code_price
          ?.amount;
    } else {
      priceString =
        jsonData['Product:ProductShowService.state']?.offer?.price_gross;
    }
    if (!priceString) {
      throw new Error('Nie znaleziono ceny w danych JSON.');
    }
    const price = parseFloat(priceString);
    if (isNaN(price)) {
      throw new Error('Nie udało się przekonwertować ceny na liczbę.');
    }
    return price / 100; //gr na zl
  }
}
