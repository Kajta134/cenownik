import { chromium } from 'playwright';

export async function scrapeAmazon(url: string): Promise<number> {
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
    locale: 'en-US',
  });

  const page = await context.newPage();

  await page.goto(url, {
    waitUntil: 'networkidle',
    timeout: 45000,
  });

  await page
    .waitForSelector('.a-price .a-offscreen', { timeout: 10000 })
    .catch(() => {});

  const selectors = [
    '.a-price .a-offscreen',
    '#priceblock_ourprice',
    '#priceblock_dealprice',
    '#price_inside_buybox',
    '#corePriceDisplay_desktop_feature_div > div.a-section.a-spacing-none.aok-align-center.aok-relative > span.a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay > span:nth-child(2) > span.a-price-whole',
    '#corePriceDisplay_desktop_feature_div > div.a-section.a-spacing-none.aok-align-center.aok-relative > span.a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay > span:nth-child(2) > span.a-price-whole',
  ];

  let priceText: string | null = null;

  for (const selector of selectors) {
    try {
      const element = await page.$(selector);
      if (element) {
        priceText = await element.innerText();
        break;
      }
    } catch (e: any) {
      console.error(
        `Błąd podczas próby pobrania ceny z selektora ${selector}:`,
        e,
      );
    }
  }

  await browser.close();

  if (!priceText) {
    throw new Error('Nie znaleziono ceny — Amazon mógł zmienić strukturę.');
  }

  const numeric = parseFloat(
    priceText.replace(/[^\d.,]/g, '').replace(',', '.'),
  );

  if (isNaN(numeric)) {
    throw new Error('Nie udało się przekonwertować ceny.');
  }

  return numeric;
}
