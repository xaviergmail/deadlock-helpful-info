import { render, screen } from '@solidjs/testing-library';
import { HashRouter } from '@solidjs/router';
import AppShell from '../AppShell';

function Wrapped(props: { children: unknown }) {
  return (
    <HashRouter>
      <AppShell>{props.children as never}</AppShell>
    </HashRouter>
  );
}

describe('AppShell', () => {
  it('renders header with site title', () => {
    render(() => (
      <Wrapped>
        <div>content</div>
      </Wrapped>
    ));
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText(/Deadlock Helpful Info/i)).toBeInTheDocument();
  });

  it('renders children inside main', () => {
    render(() => (
      <Wrapped>
        <div data-testid="child">child content</div>
      </Wrapped>
    ));
    const main = screen.getByRole('main');
    expect(main).toContainElement(screen.getByTestId('child'));
  });

  it('renders footer landmark', () => {
    render(() => (
      <Wrapped>
        <div />
      </Wrapped>
    ));
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
