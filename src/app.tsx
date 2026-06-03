import { HashRouter, Route } from '@solidjs/router';
import { type ParentProps, lazy } from 'solid-js';
import AppShell from '~/components/AppShell';

const Home = lazy(() => import('~/pages/home'));
const Heroes = lazy(() => import('~/pages/heroes'));
const Cheatsheets = lazy(() => import('~/pages/cheatsheets'));
const NotFound = lazy(() => import('~/pages/not-found'));

function AppRoot(props: ParentProps) {
  return <AppShell>{props.children}</AppShell>;
}

export default function App() {
  return (
    <HashRouter root={AppRoot}>
      <Route path="/" component={Home} />
      <Route path="/heroes" component={Heroes} />
      <Route path="/cheatsheets" component={Cheatsheets} />
      <Route path="*" component={NotFound} />
    </HashRouter>
  );
}
