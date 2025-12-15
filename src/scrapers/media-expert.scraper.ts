import fetch from 'node-fetch';
import { chromium } from 'playwright';

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

export async function scrapeMediaExpert(url: string): Promise<number> {
  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage({
    locale: 'pl-PL',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  });

  await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  const sparkId = await page.locator('#state').innerText({ timeout: 15000 });
  if (!sparkId) {
    throw new Error('Nie znaleziono Spark ID na stronie produktu.');
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
  console.log('Price String:', priceString);
  const price = parseFloat(priceString);
  console.log('Extracted Price:', price);
  if (isNaN(price)) {
    throw new Error('Nie udało się przekonwertować ceny na liczbę.');
  }
  return price / 100; //cena w json jest podana w groszach
}
