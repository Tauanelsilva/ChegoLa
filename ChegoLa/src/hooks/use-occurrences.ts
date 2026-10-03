"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchSharedOccurrences,
  migrateLocalReports,
} from "@/lib/community-reports";
import {
  INITIAL_OCCURRENCES,
  loadLocalOccurrences,
  OCCURRENCES_CHANGED_EVENT,
  type Occurrence,
} from "@/lib/occurrences";

const POLL_MS = 8000;

type FeedStatus = "loading" | "ready" | "error";

export function useOccurrenceFeed() {
  const [occurrences, setOccurrences] = useState<Occurrence[]>(INITIAL_OCCURRENCES);
  const [status, setStatus] = useState<FeedStatus>("loading");
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);
  const readyRef = useRef(false);
  const reload = useCallback(() => setTick((value) => value + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        await migrateLocalReports().catch(() => undefined);
        const next = await fetchSharedOccurrences();
        if (cancelled) return;
        readyRef.current = true;
        setOccurrences((current) => (sameOccurrences(current, next) ? current : next));
        setStatus("ready");
        setError("");
      } catch (caught) {
        if (cancelled || readyRef.current) return;
        const local = loadLocalOccurrences();
        setOccurrences([...local.occurrences, ...INITIAL_OCCURRENCES]);
        setStatus("error");
        setError(
          caught instanceof Error
            ? caught.message
            : "Não foi possível carregar os relatos compartilhados.",
        );
      }
    }

    void refresh();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, POLL_MS);
    const onChange = () => void refresh();
    window.addEventListener(OCCURRENCES_CHANGED_EVENT, onChange);
    document.addEventListener("visibilitychange", onChange);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener(OCCURRENCES_CHANGED_EVENT, onChange);
      document.removeEventListener("visibilitychange", onChange);
    };
  }, [tick]);

  return { occurrences, status, error, reload };
}

export function useOccurrences() {
  return useOccurrenceFeed().occurrences;
}

function sameOccurrences(current: Occurrence[], next: Occurrence[]) {
  if (current.length !== next.length) return false;
  return current.every(
    (item, index) => item.id === next[index]?.id && item.createdAt === next[index]?.createdAt,
  );
}
