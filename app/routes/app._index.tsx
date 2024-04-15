import { useSessionId } from "convex-helpers/react/sessions";

export default function Index() {
  const [sessionId, refresh] = useSessionId();
  return (
    <div>
      app index {sessionId}
      <button onClick={() => refresh()}>refresh</button>
    </div>
  );
}
