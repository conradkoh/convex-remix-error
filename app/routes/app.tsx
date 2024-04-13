import { Outlet } from '@remix-run/react';
import { SessionProvider } from 'convex-helpers/react/sessions';
export default function Layout() {
  return <div>hi</div>;
  // below is dead code, it doesn't get executed but still causes this to error out
  return (
    <div>
      <SessionProvider>
        <h1>App Layout</h1>
        <Outlet />
      </SessionProvider>
    </div>
  );
}
