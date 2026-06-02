import { A } from '@solidjs/router';

export default function NotFound() {
  return (
    <section class="page page--not-found">
      <h1>404 — Not Found</h1>
      <p>That route doesn&apos;t exist.</p>
      <A href="/">Go home</A>
    </section>
  );
}
