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

  test('hero picker opens and selects a hero', async ({ page }) => {
    await page.goto('/#/heroes');
    await expect(page.locator('.hero-picker__trigger [data-placeholder="true"]')).toBeVisible();
    await page.locator('.hero-picker__trigger').click();
    await expect(page.locator('[role="dialog"][aria-label="Pick a hero"]')).toBeVisible();
    const firstOption = page.locator('[role="dialog"] [role="option"]').first();
    await firstOption.click();
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
    await expect(page.locator('.hero-picker__trigger [data-placeholder="true"]')).toHaveCount(0);
    await page.screenshot({ path: '.omo/evidence/task-9-selected.png' });
  });

  test('escape key closes the hero picker', async ({ page }) => {
    await page.goto('/#/heroes');
    await page.locator('.hero-picker__trigger').click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
  });

  test('click outside closes the hero picker', async ({ page }) => {
    await page.goto('/#/heroes');
    await page.locator('.hero-picker__trigger').click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await page.mouse.click(2, 2);
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
  });
});
