import { chromium } from 'playwright';

export async function scrapeXkom(url: string): Promise<number> {
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
    .waitForSelector('meta[property="product:price:amount"]', {
      timeout: 10000,
    })
    .catch(() => {});

  const price = await page
    .locator('meta[property="product:price:amount"]')
    .getAttribute('content');
  await browser.close();

  if (!price) {
    throw new Error('Nie znaleziono ceny na stronie X-Kom.');
  }
  const numericPrice = parseFloat(price.replace(',', '.'));
  if (isNaN(numericPrice)) {
    throw new Error('Nie udało się przekonwertować ceny na liczbę.');
  }
  return numericPrice;
}
