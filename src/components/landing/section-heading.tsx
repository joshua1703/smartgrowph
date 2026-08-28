import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center flex flex-col items-center",
        align === "left" && "flex flex-col items-start",
        className,
      )}
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary shadow-xs">
        <span className="size-1.5 rounded-full bg-primary animate-pulse" />
        <span>{eyebrow}</span>
      </div>
      <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-[40px] leading-[1.12]">
        {title}
      </h2>
      {description && (
        <p className="mt-3.5 text-sm leading-relaxed text-muted-foreground sm:text-base max-w-2xl">
          {description}
        </p>
      )}
    </Reveal>
  );
}
