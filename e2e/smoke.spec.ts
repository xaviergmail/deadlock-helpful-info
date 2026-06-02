import { expect, test } from '@playwright/test';

test.describe('smoke', () => {
  test('home renders title and primary nav', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1').first()).toHaveText(/Deadlock Helpful Info/i);
    await expect(page.locator('nav[aria-label="Primary"] a')).toHaveCount(2);
  });

  test('cheatsheets route shows both PNG images', async ({ page }) => {
    await page.goto('/#/cheatsheets');
    await expect(page.locator('h1')).toContainText(/Cheatsheet/i);

    const imgs = page.locator('img[loading="lazy"]');
    await expect(imgs).toHaveCount(2);
    await imgs.first().scrollIntoViewIfNeeded();
    await page.waitForLoadState('networkidle');

    const naturals = await imgs.evaluateAll((els) =>
      (els as HTMLImageElement[]).map((img) => img.naturalWidth),
    );
    expect(naturals.every((width) => width > 0)).toBe(true);
  });

  test('unknown hash route falls to not-found', async ({ page }) => {
    await page.goto('/#/does-not-exist');
    await expect(page.locator('h1')).toContainText(/404|Not Found/i);
  });

  test('app shell landmarks present on every route', async ({ page }) => {
    for (const route of ['/', '/#/cheatsheets', '/#/missing']) {
      await page.goto(route);
      await expect(page.getByRole('banner')).toBeVisible();
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByRole('contentinfo')).toBeVisible();
    }
  });
});
