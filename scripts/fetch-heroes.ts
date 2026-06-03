#!/usr/bin/env -S node --experimental-strip-types

import { writeFile } from 'node:fs/promises';

const response = await fetch('https://api.deadlock-api.com/v1/assets/heroes');
if (!response.ok) {
  process.exitCode = 1;
  throw new Error(`Failed to fetch heroes: ${response.status} ${response.statusText}`);
}

type HeroImage = {
  icon_image_small?: string;
  icon_image_small_webp?: string;
  icon_hero_card?: string;
  icon_hero_card_webp?: string;
};

type Hero = {
  id: number;
  name: string;
  class_name: string;
  player_selectable: boolean;
  images?: HeroImage;
};

const heroes = (await response.json()) as Hero[];

const filtered = heroes.filter((h) => h.player_selectable === true);

const projected = filtered.map((h) => ({
  id: h.id,
  name: h.name,
  class_name: h.class_name,
  images: {
    icon_image_small: h.images?.icon_image_small ?? '',
    icon_image_small_webp: h.images?.icon_image_small_webp ?? '',
    icon_hero_card: h.images?.icon_hero_card ?? '',
    icon_hero_card_webp: h.images?.icon_hero_card_webp ?? '',
  },
}));

const sorted = projected.sort((a, b) => a.name.localeCompare(b.name));

if (sorted.length < 40) {
  process.exitCode = 1;
  throw new Error(`Expected at least 40 player-selectable heroes, got ${sorted.length}`);
}

const output = `${JSON.stringify(sorted, null, 2)}\n`;
await writeFile('src/generated/heroes.json', output, 'utf-8');
