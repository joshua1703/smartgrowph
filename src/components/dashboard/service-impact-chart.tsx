"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const TEMP_COLOR = "#ef4444";
const HUMIDITY_COLOR = "#38bdf8";
const FAN_COLOR = "#10b981";

const chartData = [
  { date: "06:00", temp: 25.2, humidity: 91, fanHrs: 0.2 },
  { date: "08:00", temp: 25.8, humidity: 89, fanHrs: 0.5 },
  { date: "10:00", temp: 26.5, humidity: 87, fanHrs: 1.2 },
  { date: "12:00", temp: 27.8, humidity: 83, fanHrs: 2.8 },
  { date: "14:00", temp: 28.4, humidity: 80, fanHrs: 3.5 },
  { date: "16:00", temp: 27.6, humidity: 84, fanHrs: 2.4 },
  { date: "18:00", temp: 26.9, humidity: 87, fanHrs: 1.6 },
  { date: "20:00", temp: 26.3, humidity: 89, fanHrs: 0.8 },
  { date: "22:00", temp: 25.8, humidity: 91, fanHrs: 0.3 },
];

type ChartRow = (typeof chartData)[number];

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: ChartRow }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="space-y-0.5">
        <p>
          <span className="font-semibold" style={{ color: TEMP_COLOR }}>
            {row.temp}°C
          </span>{" "}
          <span className="text-muted-foreground">temperature</span>
        </p>
        <p>
          <span className="font-semibold" style={{ color: HUMIDITY_COLOR }}>
            {row.humidity}%
          </span>{" "}
          <span className="text-muted-foreground">humidity (RH)</span>
        </p>
        <p>
          <span className="font-semibold" style={{ color: FAN_COLOR }}>
            {row.fanHrs}h
          </span>{" "}
          <span className="text-muted-foreground">fan runtime</span>
        </p>
      </div>
    </div>
  );
}

export function ServiceImpactChart() {
  return (
    <div className="space-y-4">
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 12, left: -8, bottom: 4 }}
          >
            <defs>
              <linearGradient id="fillTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={TEMP_COLOR} stopOpacity={0.3} />
                <stop offset="95%" stopColor={TEMP_COLOR} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillHumidity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={HUMIDITY_COLOR} stopOpacity={0.25} />
                <stop offset="95%" stopColor={HUMIDITY_COLOR} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillFan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={FAN_COLOR} stopOpacity={0.25} />
                <stop offset="95%" stopColor={FAN_COLOR} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              className="fill-muted-foreground"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              className="fill-muted-foreground"
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="temp"
              stroke={TEMP_COLOR}
              strokeWidth={2}
              fill="url(#fillTemp)"
            />
            <Area
              type="monotone"
              dataKey="humidity"
              stroke={HUMIDITY_COLOR}
              strokeWidth={2}
              fill="url(#fillHumidity)"
            />
            <Area
              type="monotone"
              dataKey="fanHrs"
              stroke={FAN_COLOR}
              strokeWidth={2}
              fill="url(#fillFan)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span
            className="size-2 rounded-full"
            style={{ background: TEMP_COLOR }}
          />
          Temperature (°C)
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: HUMIDITY_COLOR }} />
          Humidity (% RH)
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: FAN_COLOR }} />
          Fan Runtime (hrs)
        </span>
      </div>
    </div>
  );
}
