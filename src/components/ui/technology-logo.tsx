import { cn } from "@/lib/utils";

/* Local SVGs already have intrinsic dimensions and do not need image optimization. */
/* eslint-disable @next/next/no-img-element */

const logoSources: Record<string, string> = {
  "sql-server": "/icons/technologies/microsoftsqlserver-original.svg",
  csharp: "/icons/technologies/csharp-original.svg",
  python: "/icons/technologies/python-original.svg",
};

export function TechnologyLogo({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const source = logoSources[slug];

  if (!source) {
    return (
      <span
        className={cn("technology-logo-fallback", className)}
        aria-hidden="true"
      >
        {"{ }"}
      </span>
    );
  }

  return (
    <img
      className={cn("technology-logo", className)}
      src={source}
      alt=""
      width={128}
      height={128}
      loading="lazy"
      decoding="async"
      aria-hidden="true"
    />
  );
}
