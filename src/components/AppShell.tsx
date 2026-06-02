import { type ParentProps } from 'solid-js';

export default function AppShell(props: ParentProps) {
  return <div>{props.children}</div>;
}
