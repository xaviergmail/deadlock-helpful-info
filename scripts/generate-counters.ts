#!/usr/bin/env -S node --experimental-strip-types

import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import Ajv from 'ajv';
import { parse } from 'yaml';
import type {
  CounterEntry,
  CounterSchemaVersion,
  CountersData,
  HeroCounters,
} from '~/lib/types.ts';

const HEROES_DIR = 'data/counters/heroes';
const SCHEMA_PATH = 'data/counters/schema/v1.json';
const OUTPUT_PATH = 'src/generated/counters.json';

type RawCounterData = {
  schemaVersion: CounterSchemaVersion;
  hero: string;
  itemCounters: CounterEntry[];
};

const ajv = new Ajv();
const schema = JSON.parse(await readFile(SCHEMA_PATH, 'utf-8'));
const validate = ajv.compile(schema);

const files = (await readdir(HEROES_DIR)).filter((f) => f.endsWith('.yaml')).sort();

const result: CountersData = {};
let hasErrors = false;

for (const file of files) {
  const filePath = join(HEROES_DIR, file);
  const raw = await readFile(filePath, 'utf-8');
  const data = parse(raw) as RawCounterData;

  if (!validate(data)) {
    console.error(`Validation failed for ${file}:`, validate.errors);
    hasErrors = true;
    continue;
  }

  const key = `hero_${data.hero}`;
  const entry: HeroCounters = {
    schemaVersion: data.schemaVersion,
    hero: key,
    itemCounters: data.itemCounters,
  };
  result[key] = entry;
}

if (hasErrors) {
  process.exitCode = 1;
  throw new Error('Validation errors found. counters.json was NOT written.');
}

const output = `${JSON.stringify(result, null, 2)}\n`;
await writeFile(OUTPUT_PATH, output, 'utf-8');
console.log(`✓ Wrote ${OUTPUT_PATH} with ${Object.keys(result).length} hero(es).`);
