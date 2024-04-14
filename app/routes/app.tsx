import { Outlet } from '@remix-run/react';
import {
  SessionProvider,
  UseStorage,
  useSessionId,
} from 'convex-helpers/react/sessions';
import { SessionId } from 'convex-helpers/server/sessions';
import { useEffect, useState } from 'react';
export default function Layout() {
  // This example is not working. It is taken from https://stack.convex.dev/track-sessions-without-cookies
  //1. there are type errors
  //2. the local storage value is not stored
  return (
    <div>
      <SafeSessionProvider storageKey="sessionId" useStorage={useLocalStorage}>
        <h1>App Layout</h1>
        <DebugSessionId />
        <Outlet />
      </SafeSessionProvider>
    </div>
  );
}

/**
 * Safe wrapper around convex's session provider that ensures
 * 1. There are no hydration errors by only rendering children after hydration
 * 2. Children are not rendered until the session id is ready to be consumed
 * @param param0
 * @returns
 */

const SafeSessionProvider: typeof SessionProvider = (props) => {
  // eslint-disable-next-line react/prop-types
  const { children, ...sessionProviderProps } = props;
  return (
    // Client only prevents hydration errors, since both server and initial render will be empty
    <ClientOnly>
      <SessionProvider {...sessionProviderProps}>
        {/* RequireSessionId enforces that children will not render until session id is ready to be consumed */}
        <RequireSessionId>{children}</RequireSessionId>
      </SessionProvider>
    </ClientOnly>
  );
};

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [render, setRender] = useState(false);
  useEffect(() => {
    setRender(true);
  }, []);
  return render ? <>{children}</> : null;
}

function RequireSessionId({ children }: { children: React.ReactNode }) {
  const [sessionId] = useSessionId();
  if (!sessionId) {
    return <></>;
  }
  return <>{children}</>;
}

/**
 * Debug helper to debug session id
 * @returns
 */
function DebugSessionId() {
  const [sessionId] = useSessionId();
  console.log({ sessionId });
  return <h2>Debugger</h2>;
}

/**
 * Replacement helper for the use local storage hook that was not working
 * @param key
 * @param nextSessionId
 * @returns
 */
const useLocalStorage = function (
  key: string,
  nextSessionId: SessionId
): ReturnType<UseStorage<SessionId>> {
  const [sessionId, setSessionId] = useState<SessionId>(
    '' as string & { __SessionId: true }
  );

  useEffect(() => {
    //run only on the client
    const raw = localStorage.getItem(key);
    const prevSessionId = (raw ? JSON.parse(raw) : null) as SessionId | null; //attempt to restore session
    if (prevSessionId == null) {
      //no last session, create a new one and mark it has started
      localStorage.setItem(key, JSON.stringify(nextSessionId));
      setSessionId(nextSessionId); //if local storage has value, use it instead of the one passed in.
    } else {
      setSessionId(prevSessionId); //load the previous session
    }
  }, [key, nextSessionId]);

  const set = (val: SessionId) => {
    //do nothing - this doesn't seem to be called
    console.log({ val });
  };
  return [
    sessionId, //the value returned here will be used as the source of truth
    (v: SessionId) => {
      set(v);
    },
  ] satisfies [SessionId | null, (value: SessionId) => void];
};
