import { Outlet } from '@remix-run/react';
import { SessionProvider } from 'convex-helpers/react/sessions';
export default function Layout() {
  return (
    <div>
      <SessionProvider>
        <h1>App Layout</h1>
        <Outlet />
      </SessionProvider>
    </div>
  );
}
