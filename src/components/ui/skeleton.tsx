import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:1000px_100%] animate-shimmer",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
