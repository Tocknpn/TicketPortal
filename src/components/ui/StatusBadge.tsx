import { cn } from "@/lib/utils";

interface Props {
  status: string;
  className?: string;
}

const styles: Record<string, string> = {
  Complete:     "bg-green-100 text-green-800",
  "In Progress":"bg-blue-100 text-blue-800",
  Pending:      "bg-amber-100 text-amber-800",
  SETTLED:      "bg-green-100 text-green-800",
  ARCHIVED:     "bg-gray-100 text-gray-700",
  VOIDED:       "bg-red-100 text-red-800",
};

export default function StatusBadge({ status, className }: Props) {
  const style = styles[status] ?? "bg-surface-container text-on-surface-variant";
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold", style, className)}>
      {status}
    </span>
  );
}
