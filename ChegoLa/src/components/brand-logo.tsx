"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
  align?: "start" | "center";
};

export function BrandLogo({
  className,
  priority = false,
  align = "start",
}: BrandLogoProps) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const sources = [
    {
      src: "/chegola-logo-original.png",
      width: 1718,
      height: 492,
    },
    {
      src: "/chegola-logo.svg",
      width: 650,
      height: 180,
    },
  ];
  const source = sources[sourceIndex];

  return (
    <span
      className={cn(
        "inline-flex aspect-[1718/492] min-w-0 items-center",
        align === "center" && "justify-center",
        className,
      )}
    >
      {source && (
        <Image
          src={source.src}
          alt="Chegolá?"
          width={source.width}
          height={source.height}
          priority={priority}
          unoptimized
          onError={() => setSourceIndex((current) => current + 1)}
          className={cn(
            "block size-full object-contain",
            align === "center" ? "object-center" : "object-left",
          )}
        />
      )}
      {!source && (
        <span
          role="img"
          aria-label="Chegolá?"
          className="flex min-w-0 items-center gap-2 text-left"
        >
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-[#092f5f] text-xl font-black text-[#f5a514]"
          >
            ?
          </span>
          <span className="min-w-0 leading-tight">
            <strong className="block font-heading text-xl text-[#092f5f]">
              Chegolá?
            </strong>
          </span>
        </span>
      )}
    </span>
  );
}
