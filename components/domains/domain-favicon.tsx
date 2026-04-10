"use client";

import { useState } from "react";

type DomainFaviconProps = {
  domainName: string;
  className?: string;
};

function normalizeDomain(input: string): string {
  const trimmed = input.trim().toLowerCase();
  const withProtocol = /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return trimmed.replace(/^https?:\/\//, "").split("/")[0].split("?")[0].split("#")[0];
  }
}

export function DomainFavicon({ domainName, className }: DomainFaviconProps) {
  const domain = normalizeDomain(domainName);
  const sources = [
    `https://${domain}/favicon.ico`,
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`,
    "/nsk-iso.svg",
  ];
  const [sourceIndex, setSourceIndex] = useState(0);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- domain favicon hosts are dynamic; fallback chain uses plain img
    <img
      src={sources[sourceIndex]}
      alt=""
      aria-hidden
      width={32}
      height={32}
      className={className ?? "size-8"}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => {
        setSourceIndex((current) => Math.min(current + 1, sources.length - 1));
      }}
    />
  );
}
