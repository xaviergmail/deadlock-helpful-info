import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function readAppShellSource() {
  return readFileSync(join(process.cwd(), 'src/components/AppShell.tsx'), 'utf8');
}

describe('AppShell', () => {
  it('renders header with site title', () => {
    const source = readAppShellSource();
    expect(source).toContain('<header class="app-shell__header">');
    expect(source).toContain('Deadlock Helpful Info');
  });

  it('renders children inside main', () => {
    const source = readAppShellSource();
    expect(source).toContain('<main class="app-shell__main">{props.children}</main>');
  });

  it('renders footer landmark', () => {
    const source = readAppShellSource();
    expect(source).toContain('<footer class="app-shell__footer">');
  });
});
