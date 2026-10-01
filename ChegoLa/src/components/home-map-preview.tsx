"use client";

import { OccurrenceMap } from "@/components/occurrence-map";
import { useOccurrences } from "@/hooks/use-occurrences";

export function HomeMapPreview() {
  const occurrences = useOccurrences();

  return (
    <div className="min-w-0">
      <OccurrenceMap
        occurrences={occurrences}
        mapClassName="h-80 w-full max-w-full sm:h-96 lg:h-[440px]"
      />
    </div>
  );
}
