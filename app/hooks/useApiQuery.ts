import { useCallback, useEffect, useRef, useState } from "react";
import { forcedUpdateProxy } from "~/providers/ApolloProvider/utils/observeForcedUpdate";
import { isAbortError } from "~/errors/error";

const REFRESH_INTERVAL = 30000; // 30sec

interface UseApiQueryOptions<T> {
  fetchFn: () => Promise<T>;
  deps?: any[];
  refetchInterval?: number;
  enabled?: boolean;
}

export function useApiQuery<T>({
  fetchFn,
  deps = [],
  refetchInterval = REFRESH_INTERVAL,
  enabled = true,
}: UseApiQueryOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const isInitialFetchDone = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fetchFnRef = useRef(fetchFn);

  // keep latest fetchFn always in ref
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFnRef.current();
      setData(result);
      isInitialFetchDone.current = true;
    } catch (err) {
      if (!isAbortError(err)) setError(err);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    fetchData();
  }, deps);

  // Polling every N seconds
  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    const handleVisibility = () => {
      if (document.hidden && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      } else if (!document.hidden && !intervalRef.current) {
        intervalRef.current = setInterval(() => {
          fetchData();
        }, refetchInterval);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    handleVisibility();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refetchInterval, fetchData, enabled]);

  // Forced refetch (via proxy)
  useEffect(() => {
    const id = forcedUpdateProxy.registerListener(async () => {
      if (!isInitialFetchDone.current) return;

      try {
        await fetchData();
        forcedUpdateProxy.hasForcedUpdate = false;
      } catch (err) {
        if (!isAbortError(err))
          console.error("refetch error from forcedUpdate:", err);
      }
    });

    return () => {
      forcedUpdateProxy.removeListener(id);
    };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
