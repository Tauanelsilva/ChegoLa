"use client";

import { useEffect, useState } from "react";
import {
  loadAllOccurrences,
  OCCURRENCES_CHANGED_EVENT,
  type Occurrence,
} from "@/lib/occurrences";

export function useOccurrences() {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);

  useEffect(() => {
    const refresh = () => setOccurrences(loadAllOccurrences().occurrences);
    refresh();
    window.addEventListener(OCCURRENCES_CHANGED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(OCCURRENCES_CHANGED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return occurrences;
}
