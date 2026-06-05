import { A } from '@solidjs/router';
import type { ParentComponent } from 'solid-js';
import DeadlockUiProvider from '~/components/deadlock-ui/DeadlockUiProvider';

const AppShell: ParentComponent = (props) => {
  return (
    <DeadlockUiProvider>
      <div class="app-shell">
        <header class="app-shell__header">
          <A href="/" aria-label="Home">
            <strong>Deadlock Helpful Info</strong>
          </A>
        </header>
        <main class="app-shell__main">{props.children}</main>
        <footer class="app-shell__footer">
          <small>Community reference. Not affiliated with Valve.</small>
        </footer>
      </div>
    </DeadlockUiProvider>
  );
};

export default AppShell;
