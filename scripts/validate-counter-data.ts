#!/usr/bin/env -S node --experimental-strip-types

import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import Ajv from 'ajv';
import { parse } from 'yaml';
import type { CounterEntry, CounterSchemaVersion } from '~/lib/types.ts';

const HEROES_DIR = 'data/counters/heroes';
const SCHEMA_PATH = 'data/counters/schema/v1.json';
const HEROES_JSON_PATH = 'src/generated/heroes.json';

type RawCounterData = {
  schemaVersion: CounterSchemaVersion;
  hero: string;
  itemCounters: CounterEntry[];
};

const ajv = new Ajv();
const schema = JSON.parse(await readFile(SCHEMA_PATH, 'utf-8'));
const validate = ajv.compile(schema);

const heroes = JSON.parse(await readFile(HEROES_JSON_PATH, 'utf-8'));
const heroClassNames = new Set<string>(heroes.map((h: { class_name: string }) => h.class_name));

const files = (await readdir(HEROES_DIR)).filter((f) => f.endsWith('.yaml')).sort();

for (const file of files) {
  const filePath = join(HEROES_DIR, file);
  const raw = await readFile(filePath, 'utf-8');
  const data = parse(raw) as RawCounterData;

  // 1. Schema validation
  if (!validate(data)) {
    console.error(`[${file}] Schema validation failed:`, validate.errors);
    process.exitCode = 1;
    continue;
  }

  // 2. Hero cross-reference check
  const expectedClassname = `hero_${data.hero}`;
  if (!heroClassNames.has(expectedClassname)) {
    console.error(
      `[${file}] Hero slug "${data.hero}" (expected class_name "${expectedClassname}") not found in heroes.json`,
    );
    process.exitCode = 1;
  }

  // 3. Duplicate item check
  const seen = new Set<string>();
  for (const entry of data.itemCounters) {
    if (seen.has(entry.item)) {
      console.error(`[${file}] Duplicate item "${entry.item}" in itemCounters`);
      process.exitCode = 1;
    }
    seen.add(entry.item);
  }
}

if (process.exitCode === 1) {
  throw new Error('Validation errors found. See above for details.');
}

console.log(`✓ All ${files.length} counter file(s) passed validation.`);
