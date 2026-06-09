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

  test('counters page renders two-panel layout', async ({ page }) => {
    await page.goto('/#/counters');
    await expect(page.locator('.counters__detail-panel')).toBeVisible();
    await expect(page.locator('.counters__hero-panel')).toBeVisible();
    await expect(page.locator('[role="option"]')).toHaveCount(38);
    await expect(page.locator('.counter-detail-card')).toHaveCount(2);
    await page.screenshot({ path: '.omo/evidence/task-9-two-panel-layout.png' });
  });

  test('clicking a hero fills Slot 1', async ({ page }) => {
    await page.goto('/#/counters');
    const firstTile = page.locator('[role="option"]').first();
    const heroName = await firstTile.locator('img').getAttribute('alt');
    await firstTile.click();

    const slot1 = page.locator('.counter-detail-card').first();
    await expect(slot1.locator('.counter-detail-card__name')).toHaveText(heroName ?? '');
    await expect(slot1.locator('.counter-detail-card__section--curated')).toBeVisible();
    await expect(slot1.locator('.counter-detail-card__section--analytics')).toBeVisible();
    await expect(page.locator('.counters__prompt')).toBeVisible();
  });

  test('clicking second hero fills Slot 2', async ({ page }) => {
    await page.goto('/#/counters');
    const tiles = page.locator('[role="option"]');
    await tiles.nth(0).click();
    await tiles.nth(1).click();

    const slot2 = page.locator('.counter-detail-card').nth(1);
    const secondHeroName = await tiles.nth(1).locator('img').getAttribute('alt');
    await expect(slot2.locator('.counter-detail-card__name')).toHaveText(secondHeroName ?? '');
    await expect(slot2.locator('.counter-detail-card__section--curated')).toBeVisible();
    await expect(slot2.locator('.counter-detail-card__section--analytics')).toBeVisible();
  });

  test('two heroes selected disables remaining tiles', async ({ page }) => {
    await page.goto('/#/counters');
    const tiles = page.locator('[role="option"]');
    await tiles.nth(0).click();
    await tiles.nth(1).click();

    // Remaining tiles should be disabled
    const disabledTiles = page.locator('[role="option"][aria-disabled="true"]');
    await expect(disabledTiles).toHaveCount(36);

    for (let i = 0; i < 5; i++) {
      await expect(disabledTiles.nth(i)).toHaveClass(/hero-tile--disabled/);
    }

    // Clicking a disabled tile should not change selection
    const slot1Name = await page
      .locator('.counter-detail-card')
      .first()
      .locator('.counter-detail-card__name')
      .textContent();
    await disabledTiles.first().click({ force: true });
    await expect(
      page.locator('.counter-detail-card').first().locator('.counter-detail-card__name'),
    ).toHaveText(slot1Name ?? '');

    await page.screenshot({ path: '.omo/evidence/task-9-disabled-tiles.png' });
  });

  test('clicking selected hero unselects it', async ({ page }) => {
    await page.goto('/#/counters');
    const tiles = page.locator('[role="option"]');
    await tiles.nth(0).click();
    await tiles.nth(1).click();

    // Click the first selected hero to unselect it
    await tiles.nth(0).click();

    // Slot 1 should now show the hero that was in Slot 2
    const slot1Name = await page
      .locator('.counter-detail-card')
      .first()
      .locator('.counter-detail-card__name')
      .textContent();
    const secondHeroName = await tiles.nth(1).locator('img').getAttribute('alt');
    expect(slot1Name).toBe(secondHeroName);

    // Slot 2 should be empty (placeholder)
    const slot2 = page.locator('.counter-detail-card').nth(1);
    await expect(slot2.locator('.counter-detail-card__placeholder')).toBeVisible();

    // Only one tile should be selected now
    await expect(tiles.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(tiles.nth(0)).toHaveAttribute('aria-selected', 'false');

    await page.screenshot({ path: '.omo/evidence/task-9-promotion.png' });
  });

  test('shared items are highlighted', async ({ page }) => {
    const mockItems = [
      {
        id: 1001,
        class_name: 'upgrade_spellbreaker',
        name: 'Spellbreaker',
        type: 'upgrade',
        item_slot_type: 'spirit',
        item_tier: 3,
        activation: 'instant_cast',
        cost: 3000,
        tooltip_sections: [],
        component_items: [],
      },
      {
        id: 1002,
        class_name: 'upgrade_grit',
        name: 'Grit',
        type: 'upgrade',
        item_slot_type: 'vitality',
        item_tier: 3,
        activation: 'passive',
        cost: 3000,
        tooltip_sections: [],
        component_items: [],
      },
      {
        id: 1003,
        class_name: 'upgrade_thermal_detonator',
        name: 'Thermal Detonator',
        type: 'upgrade',
        item_slot_type: 'weapon',
        item_tier: 3,
        activation: 'instant_cast',
        cost: 3000,
        tooltip_sections: [],
        component_items: [],
      },
      {
        id: 1004,
        class_name: 'upgrade_return_fire',
        name: 'Return Fire',
        type: 'upgrade',
        item_slot_type: 'weapon',
        item_tier: 3,
        activation: 'passive',
        cost: 3000,
        tooltip_sections: [],
        component_items: [],
      },
      {
        id: 1005,
        class_name: 'upgrade_melee_rebuttal',
        name: 'Melee Rebuttal',
        type: 'upgrade',
        item_slot_type: 'vitality',
        item_tier: 3,
        activation: 'passive',
        cost: 3000,
        tooltip_sections: [],
        component_items: [],
      },
    ];

    await page.route('**/v1/assets/generic-data', (route) => route.fulfill({ json: {} }));
    await page.route('**/v1/assets/items**', (route) => route.fulfill({ json: mockItems }));

    await page.goto('/#/counters');

    // Select Holliday (hero_astro) and Drifter (hero_drifter) — they share
    // upgrade_spellbreaker in curated and upgrade_grit in analytics
    await page.getByRole('option', { name: /holliday/i }).click();
    await page.getByRole('option', { name: /drifter/i }).click();

    // Verify shared items are highlighted (shared items appear in both cards)
    const sharedItems = page.locator('.counter-item--shared');
    await expect(sharedItems).toHaveCount(4);

    // Verify the ×2 badge is present on shared items (2 per card)
    await expect(page.locator('.counter-detail-card__shared-badge')).toHaveCount(4);

    await page.screenshot({ path: '.omo/evidence/task-9-shared-items.png' });
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

    await page.goto('/#/counters');
    const hazeTile = page.getByRole('option', { name: /haze/i });
    await hazeTile.click();
    await expect(hazeTile).toHaveAttribute('aria-selected', 'true');

    const slot1 = page.locator('.counter-detail-card').first();
    await expect(slot1.locator('.counter-detail-card__section--curated')).toBeAttached();
    await expect(slot1.locator('.counter-detail-card__section--analytics')).toBeAttached();
    await expect(slot1.locator('.counter-detail-card__section--curated dl-item-card')).toHaveCount(
      5,
    );
    await expect(
      slot1.locator('.counter-detail-card__section--analytics dl-item-card'),
    ).toHaveCount(3);
    await expect(
      slot1.locator('.counter-detail-card__section--analytics .counter-detail-card__stat-delta'),
    ).toHaveCount(3);
    await expect(page.getByText('Win-rate delta vs average')).toBeVisible();
    await expect(page.locator('dl-item-card')).toHaveCount(8);

    // Each analytics delta renders a signed percentage-point value using the
    // Unicode minus (U+2212), never an ASCII hyphen, and carries a valid trend
    // bucket that drives the colour token. Guards the feature's core display.
    const deltaTexts = await slot1
      .locator('.counter-detail-card__section--analytics .counter-detail-card__stat-delta')
      .allTextContents();
    expect(deltaTexts).toHaveLength(3);
    for (const text of deltaTexts) {
      expect(text).toMatch(/^[+\u2212]?\d+\.\d+pp$/);
      expect(text).not.toContain('-'); // ASCII hyphen-minus must never leak in
    }
    const trends = await slot1
      .locator('.counter-detail-card__section--analytics .counter-detail-card__stat-item')
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

  test('/heroes redirects to /counters', async ({ page }) => {
    await page.goto('/#/heroes');
    // Wait for navigation to complete
    await page.waitForURL(/\/counters/);
    await expect(page.locator('.counters__detail-panel')).toBeVisible();
    await expect(page.locator('.counters__hero-panel')).toBeVisible();
    await expect(page.locator('[role="option"]')).toHaveCount(38);
    await page.screenshot({ path: '.omo/evidence/task-9-redirect.png' });
  });
});
