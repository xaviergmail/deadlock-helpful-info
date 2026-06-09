import { HashRouter, Navigate, Route } from '@solidjs/router';
import { type ParentProps, lazy } from 'solid-js';
import AppShell from '~/components/AppShell';

const Home = lazy(() => import('~/pages/home'));
const Counters = lazy(() => import('~/pages/counters'));
const Cheatsheets = lazy(() => import('~/pages/cheatsheets'));
const NotFound = lazy(() => import('~/pages/not-found'));

function AppRoot(props: ParentProps) {
  return <AppShell>{props.children}</AppShell>;
}

export default function App() {
  return (
    <HashRouter root={AppRoot}>
      <Route path="/" component={Home} />
      <Route path="/counters" component={Counters} />
      <Route path="/heroes" component={() => <Navigate href="/counters" />} />
      <Route path="/cheatsheets" component={Cheatsheets} />
      <Route path="*" component={NotFound} />
    </HashRouter>
  );
}
