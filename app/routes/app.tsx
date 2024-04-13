import { Outlet } from '@remix-run/react';
import { SessionProvider, UseStorage } from 'convex-helpers/react/sessions';
import { SessionId } from 'convex-helpers/server/sessions';
import { useLocalStorage } from 'usehooks-ts';
export default function Layout() {
  // This example is not working. It is taken from https://stack.convex.dev/track-sessions-without-cookies
  //1. there are type errors
  //2. the local storage value is not stored
  return (
    <div>
      <SessionProvider storageKey="sessionId" useStorage={useLocalStorage}>
        <h1>App Layout</h1>
        <Outlet />
      </SessionProvider>
    </div>
  );
}

/**
 * This is a working version with some effort
 * 1. Ensure that SessionProvider doesn't run on the server
 * 2. Ensure that local storage is not called when the component is rendered on the server
 */
export function WorkingLayout() {
  // check if this is running in local or server
  const isServer = typeof window === 'undefined';
  if (isServer) {
    return <></>;
  }
  // const startSession = useMutation(api.session.startSession)
  const startSession = function ({ sessionId }: { sessionId: string }) {
    //mock implementation
    console.log({ sessionId });
  };
  const useStorage: UseStorage<SessionId> = function <T extends string>(
    key: string,
    nextSessionId: T
  ) {
    if (isServer) return ['' as SessionId, () => {}]; //do nothing if server
    const raw = localStorage.getItem(key);
    let sessionId = (raw ? JSON.parse(raw) : null) as T | null; //attempt to restore session
    if (sessionId == null) {
      //no last session, create a new one and mark it has started
      localStorage.setItem(key, JSON.stringify(nextSessionId));
      sessionId = nextSessionId; //if local storage has value, use it instead of the one passed in.
      (async () => {
        try {
          await startSession({ sessionId }); //start the session
        } catch (err) {
          localStorage.removeItem(key); //remove the session if it fails to start
        }
      })();
    }
    const set = (val: T) => {
      //do nothing - this doesn't seem to be called
      console.log({ val });
    };
    return [
      sessionId, //the value returned here will be used as the source of truth
      (v: T) => {
        set(v);
      },
    ] satisfies [T, (value: T) => void];
  };
  return (
    <div>
      <SessionProvider storageKey="sessionId" useStorage={useStorage}>
        <h1>App Layout</h1>
        <Outlet />
      </SessionProvider>
    </div>
  );
}
