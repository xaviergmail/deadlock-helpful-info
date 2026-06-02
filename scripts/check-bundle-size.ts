#!/usr/bin/env node
import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { gzipSize } from 'gzip-size';

const DIST_DIR = 'dist';
const BUDGETS = {
  initialJs: 60 * 1024,
  totalCss: 20 * 1024,
  singleChunkMax: 100 * 1024,
} as const;

interface OversizedChunk {
  readonly file: string;
  readonly gz: number;
  readonly kind: 'js' | 'css';
}

interface SizeReport {
  readonly initialJsBytes: number;
  readonly totalCssBytes: number;
  readonly budgets: typeof BUDGETS;
  readonly oversizedChunks: ReadonlyArray<OversizedChunk>;
  readonly violations: ReadonlyArray<string>;
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const filePath = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walk(filePath)));
      continue;
    }

    out.push(filePath);
  }

  return out;
}

function stripBase(ref: string): string {
  let path = ref.replace(/^\//, '');
  path = path.replace(/^deadlock-helpful-info\//, '');
  return path;
}

function extractInitialJsRefs(indexHtml: string): Set<string> {
  const refs = new Set<string>();

  const scriptPattern = /<script[^>]+type="module"[^>]+src="([^"]+\.js)"/g;
  for (
    let match = scriptPattern.exec(indexHtml);
    match !== null;
    match = scriptPattern.exec(indexHtml)
  ) {
    const ref = match[1];
    if (ref) refs.add(stripBase(ref));
  }

  const preloadPattern = /<link[^>]+rel="modulepreload"[^>]+href="([^"]+\.js)"/g;
  for (
    let match = preloadPattern.exec(indexHtml);
    match !== null;
    match = preloadPattern.exec(indexHtml)
  ) {
    const ref = match[1];
    if (ref) refs.add(stripBase(ref));
  }

  return refs;
}

async function main(): Promise<void> {
  const files = await walk(DIST_DIR);
  const indexHtml = await readFile(join(DIST_DIR, 'index.html'), 'utf8');
  const initialJsRefs = extractInitialJsRefs(indexHtml);

  let initialJsBytes = 0;
  let totalCssBytes = 0;
  const oversizedChunks: OversizedChunk[] = [];

  for (const filePath of files) {
    const rel = relative(DIST_DIR, filePath);
    if (!rel.endsWith('.js') && !rel.endsWith('.css')) continue;

    const contents = await readFile(filePath);
    const gz = await gzipSize(contents);

    if (rel.endsWith('.js') && initialJsRefs.has(rel)) {
      initialJsBytes += gz;
    }

    if (rel.endsWith('.css')) {
      totalCssBytes += gz;
    }

    if (gz > BUDGETS.singleChunkMax) {
      oversizedChunks.push({ file: rel, gz, kind: rel.endsWith('.css') ? 'css' : 'js' });
    }
  }

  const violations: string[] = [];
  if (initialJsBytes > BUDGETS.initialJs) {
    violations.push(`initialJs ${initialJsBytes} > ${BUDGETS.initialJs}`);
  }
  if (totalCssBytes > BUDGETS.totalCss) {
    violations.push(`totalCss ${totalCssBytes} > ${BUDGETS.totalCss}`);
  }
  for (const chunk of oversizedChunks) {
    violations.push(`singleChunk ${chunk.file} ${chunk.gz} > ${BUDGETS.singleChunkMax}`);
  }

  const report: SizeReport = {
    initialJsBytes,
    totalCssBytes,
    budgets: BUDGETS,
    oversizedChunks,
    violations,
  };

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

  if (violations.length > 0) {
    console.error('Bundle budget violations:');
    for (const violation of violations) {
      console.error(`- ${violation}`);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
