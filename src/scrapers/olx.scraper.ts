import { chromium } from 'playwright';

export async function scrapeOlx(url: string): Promise<number | null> {
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
    .catch((e) => {
      console.error('Błąd podczas ładowania strony:', e);
      return null;
    });

  const priceText = await page
    .locator('[data-testid="ad-price"], [data-testid="ad-price-container"]')
    .first()
    .innerText({ timeout: 15000 })
    .catch(() => {
      console.warn('Nie znaleziono selektora ceny na stronie OLX.');
      return null;
    });
  if (!priceText) {
    return null;
  }

  await browser.close();

  const price = Number(
    priceText.replace(/\s/g, '').replace('zł', '').replace(',', '.'),
  );

  if (isNaN(price)) {
    throw new Error(`Nieprawidłowa cena: ${priceText}`);
  }

  return price;
}
