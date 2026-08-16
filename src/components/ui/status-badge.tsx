import { labStatus, type LabStatus } from "@/data/lab";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: LabStatus }) {
  const meta = labStatus[status];

  return (
    <span className={cn("status-badge", meta.className)}>
      <span aria-hidden="true">{meta.symbol}</span>
      {meta.label}
    </span>
  );
}
