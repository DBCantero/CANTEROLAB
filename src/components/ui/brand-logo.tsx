import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  markOnly?: boolean;
};

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("brand-logo-mark", className)}
      fill="none"
      focusable="false"
      viewBox="0 0 64 64"
    >
      <path
        d="M30.5 14.5a17.5 17.5 0 1 0 0 35"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="6.5"
      />
      <path
        d="M38 14.5v30h15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="6.5"
      />
      <path
        className="brand-logo-mark-accent"
        d="M47 52.5h11"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="4.5"
      />
    </svg>
  );
}

export function BrandLogo({ className, markOnly = false }: BrandLogoProps) {
  return (
    <span className={cn("brand-logo", className)}>
      <BrandMark />
      {markOnly ? null : (
        <span className="brand-logo-wordmark">CANTEROLAB</span>
      )}
    </span>
  );
}
