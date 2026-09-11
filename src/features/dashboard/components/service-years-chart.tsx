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
import type { DashboardPersonnel } from "../api";

/**
 * ServiceYearsChart (SSOT Section 2.2, Phase 2 step 6).
 * Recharts area chart of cumulative service years at each career milestone
 * (join + each promotion, up to today). Presentational: personnel passed in.
 */
export function ServiceYearsChart({
  personnel,
}: {
  personnel: DashboardPersonnel;
}) {
  const join = new Date(personnel.joinDate);
  const yearsBetween = (date: Date) =>
    Math.max(
      0,
      Math.round(
        ((date.getTime() - join.getTime()) / (365.25 * 24 * 3600 * 1000)) * 10
      ) / 10
    );

  const milestones = [
    { label: "Joined", date: join },
    ...personnel.promotionHistory.map((p) => ({
      label: p.toRank,
      date: new Date(p.date),
    })),
    { label: "Today", date: new Date() },
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  const data = milestones.map((m) => ({
    label: m.label,
    year: m.date.getFullYear(),
    years: yearsBetween(m.date),
  }));

  return (
    <div className="h-56 w-full" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="serviceYears" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--blue-500)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--blue-500)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            width={40}
            unit="y"
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--foreground)",
            }}
            formatter={(value: number) => [`${value} yrs`, "Service"]}
          />
          <Area
            type="monotone"
            dataKey="years"
            stroke="var(--blue-500)"
            strokeWidth={2}
            fill="url(#serviceYears)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
