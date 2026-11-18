import { useEffect, useRef, useState } from 'react';
import { fetchAgentStates } from '../OfficeScene3D';

/**
 * Polls /api/v1/agents every 10 seconds and returns
 * { states: Record<agentKey, stateString>, loading: boolean }
 */
export function useAgentStates(): { states: Record<string, string>; loading: boolean } {
  const [states, setStates] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    const load = async () => {
      try {
        const data = await fetchAgentStates();
        if (mounted.current) {
          setStates(data);
          setLoading(false);
        }
      } catch {
        if (mounted.current) setLoading(false);
      }
    };

    load();
    const interval = window.setInterval(load, 10_000);

    return () => {
      mounted.current = false;
      window.clearInterval(interval);
    };
  }, []);

  return { states, loading };
}
