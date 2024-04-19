import { Outlet } from '@remix-run/react';
import {
  SessionProvider,
  UseStorage,
  useSessionId,
} from 'convex-helpers/react/sessions';
import { SessionId } from 'convex-helpers/server/sessions';
import { useEffect, useState } from 'react';
export default function Layout() {
  runFunc({
    onClient: () => {
      console.log('Client rendering layout');
    },
    onServer: () => {
      console.log('Server rendering layout');
    },
  });
  console.log('re-rendering layout');
  return (
    <div>
      <SessionProvider storageKey="sessionId" useStorage={useLocalStorage}>
        <h1>App Layout</h1>
        <DebugSessionId />
        <Outlet />
      </SessionProvider>
    </div>
  );
}

/**
 * Debug helper to debug session id
 * @returns
 */
function DebugSessionId() {
  const [sessionId] = useSessionId();
  runFunc({
    onClient: () => {
      console.log(
        'debugging session on client. session id = ',
        sessionId,
        typeof sessionId
      );
    },
    onServer: () => {
      console.log('debugging session on server. session id = ', sessionId);
    },
  });
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
  const [sessionId, setSessionId] = useState<SessionId>('' as SessionId);

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const set = (val: SessionId) => {
    //do nothing - this doesn't seem to be called
    // console.log({ val });
  };
  return [
    sessionId, //the value returned here will be used as the source of truth
    (v: SessionId) => {
      set(v);
    },
  ] as const;
};

function runFunc(p: { onClient: () => void; onServer: () => void }) {
  const isServer = typeof window === 'undefined';
  if (isServer) {
    p.onServer();
  } else {
    p.onClient();
  }
}
