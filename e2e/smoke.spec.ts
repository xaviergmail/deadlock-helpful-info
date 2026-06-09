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

  test('counter items render for Haze', async ({ page }) => {
    const mockItems = [
      {
        id: 1001,
        class_name: 'metal_skin',
        name: 'Metal Skin',
        type: 'upgrade',
        item_slot_type: 'vitality',
        item_tier: 4,
        activation: 'instant_cast',
        cost: 3000,
        tooltip_sections: [],
        component_items: [],
      },
      {
        id: 1002,
        class_name: 'knockdown',
        name: 'Knockdown',
        type: 'upgrade',
        item_slot_type: 'spirit',
        item_tier: 3,
        activation: 'instant_cast',
        cost: 3000,
        tooltip_sections: [],
        component_items: [],
      },
      {
        id: 1003,
        class_name: 'return_fire',
        name: 'Return Fire',
        type: 'upgrade',
        item_slot_type: 'weapon',
        item_tier: 3,
        activation: 'passive',
        cost: 3000,
        tooltip_sections: [],
        component_items: [],
      },
    ];

    await page.route('**/v1/assets/generic-data', (route) => route.fulfill({ json: {} }));
    await page.route('**/v1/assets/items**', (route) => route.fulfill({ json: mockItems }));

    await page.goto('/#/heroes');
    const hazeTile = page.getByRole('option', { name: /haze/i });
    await hazeTile.click();
    await expect(hazeTile).toHaveAttribute('aria-selected', 'true');

    await expect(page.locator('.hero-card__section--curated')).toBeAttached();
    await expect(page.locator('.hero-card__section--analytics')).toBeAttached();
    await expect(page.locator('.hero-card__section-empty')).not.toBeAttached();
    await expect(page.locator('.hero-card__section--curated dl-item-card')).toHaveCount(3);
    await expect(page.locator('.hero-card__section--analytics dl-item-card')).toHaveCount(3);
    await expect(page.locator('.hero-card__section--analytics .hero-card__stat-delta')).toHaveCount(
      3,
    );
    await expect(page.getByText('Win-rate delta vs average')).toBeVisible();
    await expect(page.locator('dl-item-card')).toHaveCount(6);

    // Each analytics delta renders a signed percentage-point value using the
    // Unicode minus (U+2212), never an ASCII hyphen, and carries a valid trend
    // bucket that drives the colour token. Guards the feature's core display.
    const deltaTexts = await page
      .locator('.hero-card__section--analytics .hero-card__stat-delta')
      .allTextContents();
    expect(deltaTexts).toHaveLength(3);
    for (const text of deltaTexts) {
      expect(text).toMatch(/^[+\u2212]?\d+\.\d+pp$/);
      expect(text).not.toContain('-'); // ASCII hyphen-minus must never leak in
    }
    const trends = await page
      .locator('.hero-card__section--analytics .hero-card__stat-item')
      .evaluateAll((els) => els.map((el) => el.getAttribute('data-trend')));
    for (const trend of trends) {
      expect(['positive', 'negative', 'neutral']).toContain(trend);
    }

    // Tap-to-reveal UX (our code, not library Shadow DOM): clicking a counter
    // item toggles the `.is-active` class. We dispatch the click rather than
    // calling `.click()` because mocked item responses do not fully hydrate
    // Stencil's Shadow DOM, leaving the host element without rendered content
    // → Playwright considers it not visible and aborts a physical click. The
    // Solid `onClick` handler we are validating fires on the bubbled DOM event
    // regardless of host visibility, so `dispatchEvent` is the right primitive
    // here. Hover-tooltip rendering lives inside `<dl-item-card>`'s Shadow DOM
    // and is owned by @deadlock-api/ui-core; manual QA covers it.
    const firstCounter = page.locator('dl-item-card').first();
    await firstCounter.dispatchEvent('click');
    await expect(firstCounter).toHaveClass(/is-active/);
    await firstCounter.dispatchEvent('click');
    await expect(firstCounter).not.toHaveClass(/is-active/);
  });

  test('curated hero (Apollo) shows both sections', async ({ page }) => {
    await page.route('**/v1/assets/generic-data', (route) => route.fulfill({ json: {} }));
    await page.route('**/v1/assets/items**', (route) => route.fulfill({ json: [] }));

    await page.goto('/#/heroes');
    await page.getByRole('option', { name: /apollo/i }).click();

    await expect(page.locator('.hero-card__section--curated')).toBeAttached();
    await expect(page.locator('.hero-card__section--analytics')).toBeAttached();
    await expect(page.locator('.hero-card__section--curated dl-item-card')).toHaveCount(3);
    await expect(page.locator('.hero-card__section--analytics dl-item-card')).toHaveCount(3);
    await expect(
      page.locator('.hero-card__section--analytics .hero-card__stat-samples'),
    ).toHaveCount(3);
  });
});
