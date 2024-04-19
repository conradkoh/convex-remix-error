import { useSessionId } from 'convex-helpers/react/sessions';

export default function Index() {
  const [sessionId] = useSessionId();
  return <div>app index @ {sessionId}</div>;
}
