"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { ChartDataPoint, formatShortTime } from "@/lib/elexon";
import { computeStats } from "@/lib/stats";

interface Props {
  data: ChartDataPoint[];
  horizonHours: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#1a2235",
        border: "1px solid #1e2d45",
        borderRadius: 10,
        padding: "10px 14px",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 13,
        minWidth: 180,
      }}
    >
      <p style={{ color: "#64748b", marginBottom: 6, fontSize: 11 }}>
        {label}
      </p>
      {payload.map((p) => (
        <div
          key={p.name}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 20,
            marginBottom: 3,
          }}
        >
          <span style={{ color: p.color, fontWeight: 500 }}>{p.name}</span>
          <span style={{ color: "#e2e8f0", fontFamily: "'JetBrains Mono'" }}>
            {p.value != null ? `${p.value.toFixed(0)} MW` : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit?: string;
  color?: string;
}) {
  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #1e2d45",
        borderRadius: 12,
        padding: "16px 20px",
        flex: 1,
        minWidth: 120,
      }}
    >
      <p style={{ color: "#64748b", fontSize: 11, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </p>
      <p style={{ color: color ?? "#e2e8f0", fontSize: 22, fontFamily: "'JetBrains Mono'", fontWeight: 500 }}>
        {value}
        {unit && (
          <span style={{ fontSize: 13, color: "#64748b", marginLeft: 4 }}>
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}

// Thin out data for X axis labels
function getTickFormatter(data: ChartDataPoint[]) {
  return (value: string) => {
    if (!value) return "";
    try {
      const d = new Date(value);
      return d.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return value;
    }
  };
}

export default function WindChart({ data, horizonHours }: Props) {
  const stats = computeStats(data);

  // Subsample ticks so they don't overlap
  const tickInterval = Math.max(1, Math.floor(data.length / 8));

  const chartData = data.map((d) => ({
    ...d,
    timeLabel: d.time,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Stats Row */}
      {stats && (
        <div
          className="animate-fade-up-delay"
          style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
        >
          <StatCard
            label="Mean Abs Error"
            value={stats.mae.toFixed(0)}
            unit="MW"
            color="#f59e0b"
          />
          <StatCard
            label="RMSE"
            value={stats.rmse.toFixed(0)}
            unit="MW"
            color="#f59e0b"
          />
          <StatCard
            label="Actual Peak"
            value={stats.actualPeak.toFixed(0)}
            unit="MW"
            color="#38bdf8"
          />
          <StatCard
            label="Forecast Peak"
            value={stats.forecastPeak.toFixed(0)}
            unit="MW"
            color="#4ade80"
          />
          <StatCard
            label="Forecast Coverage"
            value={`${stats.coverage}%`}
            color={stats.coverage > 80 ? "#4ade80" : "#f59e0b"}
          />
        </div>
      )}

      {/* Chart */}
      <div
        className="animate-fade-up-delay-2"
        style={{
          background: "#111827",
          border: "1px solid #1e2d45",
          borderRadius: 16,
          padding: "24px 16px 16px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            paddingLeft: 8,
          }}
        >
          <div>
            <p style={{ color: "#e2e8f0", fontWeight: 500, fontSize: 14 }}>
              Wind Power Generation
            </p>
            <p style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>
              {data.length} data points · Horizon ≥ {horizonHours}h
            </p>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 24,
                  height: 3,
                  background: "#38bdf8",
                  borderRadius: 2,
                }}
              />
              <span style={{ color: "#94a3b8", fontSize: 12 }}>Actual</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 24,
                  height: 3,
                  background: "#4ade80",
                  borderRadius: 2,
                  borderTop: "3px dashed #4ade80",
                }}
              />
              <span style={{ color: "#94a3b8", fontSize: 12 }}>Forecast</span>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={380}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e2d45"
              vertical={false}
            />
            <XAxis
              dataKey="timeLabel"
              tickFormatter={getTickFormatter(data)}
              interval={tickInterval}
              tick={{ fill: "#64748b", fontSize: 11, fontFamily: "'DM Sans'" }}
              axisLine={{ stroke: "#1e2d45" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 11, fontFamily: "'JetBrains Mono'" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}`}
              unit=" MW"
              width={70}
            />
            <Tooltip
              content={<CustomTooltip />}
              labelFormatter={(label) => {
                try {
                  return new Date(label).toLocaleString("en-GB", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });
                } catch {
                  return label;
                }
              }}
            />
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              activeDot={{ r: 5, fill: "#38bdf8", stroke: "#0a0f1a", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              name="Forecast"
              stroke="#4ade80"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              connectNulls={false}
              activeDot={{ r: 5, fill: "#4ade80", stroke: "#0a0f1a", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
