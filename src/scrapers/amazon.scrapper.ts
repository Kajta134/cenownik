import { chromium } from 'playwright';

export async function scrapeAmazon(url) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
    locale: 'en-US', // Amazon PL działa lepiej z angielskim locale
  });

  const page = await context.newPage();

  await page.goto(url, {
    waitUntil: 'networkidle',
    timeout: 40000,
  });

  const selectors = [
    '#priceblock_ourprice',
    '#priceblock_dealprice',
    '.a-price .a-offscreen',
    '#price_inside_buybox',
  ];

  let priceText = null;

  for (const sel of selectors) {
    try {
      const el = await page.$(sel);
      if (el) {
        priceText = await el.innerText();
        break;
      }
    } catch {}
  }

  await browser.close();

  if (!priceText) {
    throw new Error('Nie znaleziono ceny — Amazon mógł zablokować scraper.');
  }

  // Zamiana , i . oraz usuwanie waluty
  const price = parseFloat(priceText.replace(/[^\d.,]/g, '').replace(',', '.'));

  return price;
}
