import { expect, test } from '@playwright/test';

test.describe('smoke', () => {
  test('home renders title and primary nav', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1').first()).toHaveText(/Deadlock Helpful Info/i);
    await expect(page.locator('nav[aria-label="Primary"] a')).toHaveCount(3);
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

  test('heroes page shows card + inline grid (no overlay, no trigger)', async ({ page }) => {
    await page.goto('/#/heroes');
    await expect(page.locator('.hero-card')).toBeVisible();
    await expect(page.locator('.hero-card [data-placeholder="true"]')).toBeVisible();
    await expect(page.locator('.hero-picker__grid')).toBeVisible();
    await expect(page.locator('[role="option"]')).toHaveCount(38);
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
    await expect(page.locator('.hero-picker__trigger')).toHaveCount(0);
  });

  test('clicking a tile updates the card inline', async ({ page }) => {
    await page.goto('/#/heroes');
    await page.locator('[role="option"]').first().click();
    await expect(page.locator('.hero-card [data-placeholder="true"]')).toHaveCount(0);
    await expect(page.locator('.hero-card img, .hero-card__fallback')).toBeVisible();
    await page.screenshot({ path: '.omo/evidence/heroes-inline-selected.png' });
  });

  test('hero tiles do not exceed native image size (128px)', async ({ page }) => {
    await page.goto('/#/heroes');
    const tile = page.locator('[role="option"]').first();
    const box = await tile.boundingBox();
    expect(box).not.toBeNull();
    expect(box?.width).toBeLessThanOrEqual(128);
  });
});
