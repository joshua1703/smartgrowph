"use client";

import { useInView } from "./reveal";
import { cn } from "@/lib/utils";

export function AreaChart({
  values,
  className,
  strokeClass = "stroke-primary",
  gradientId = "landing-area-fill",
  ariaLabel = "Live environmental trend chart",
}: {
  values: number[];
  className?: string;
  strokeClass?: string;
  gradientId?: string;
  ariaLabel?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);

  const W = 360;
  const H = 120;
  const PAD = 10;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const points = values.map((v, i) => {
    const x = PAD + (i * (W - PAD * 2)) / (values.length - 1);
    const y = H - PAD - ((v - min) / span) * (H - PAD * 2);
    return [x, y] as const;
  });

  const line = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");

  const last = points[points.length - 1];
  const area = `${line} L${last[0].toFixed(1)},${H - PAD} L${points[0][0].toFixed(1)},${H - PAD} Z`;

  return (
    <div ref={ref} className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-full w-full"
        role="img"
        aria-label={ariaLabel}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={area}
          fill={`url(#${gradientId})`}
          className="transition-opacity duration-700"
          style={{ opacity: inView ? 1 : 0 }}
        />
        <path
          d={line}
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("transition-all duration-[1400ms] ease-out", strokeClass)}
          style={{ strokeDasharray: 1000, strokeDashoffset: inView ? 0 : 1000 }}
        />
        <circle
          cx={last[0]}
          cy={last[1]}
          r="3.5"
          fill="var(--primary)"
          className="transition-opacity delay-500 duration-700"
          style={{ opacity: inView ? 1 : 0 }}
        />
      </svg>
    </div>
  );
}
