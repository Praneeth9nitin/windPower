"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { ChartDataPoint } from "@/lib/elexon";
import { Wind, RefreshCw, AlertCircle, Info } from "lucide-react";

const WindChart = dynamic(() => import("@/components/WindChart"), {
  ssr: false,
});

const DEFAULT_FROM = "2024-01-01";
const DEFAULT_TO = "2024-01-07";
const DEFAULT_HORIZON = 4;

export default function Home() {
  const [from, setFrom] = useState(DEFAULT_FROM);
  const [to, setTo] = useState(DEFAULT_TO);
  const [horizon, setHorizon] = useState(DEFAULT_HORIZON);
  const [data, setData] = useState<ChartDataPoint[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!from || !to) return;
    if (new Date(from) > new Date(to)) {
      setError("Start date must be before end date");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/wind-data?from=${from}&to=${to}&horizon=${horizon}`
      );
      const json = await res.json();

      if (!res.ok) throw new Error(json.error ?? "Unknown error");
      setData(json.chartData);
      setLastFetched(new Date().toLocaleTimeString("en-GB"));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [from, to, horizon]);

  // Load default on mount
  useEffect(() => {
    fetchData();
  }, []);

  const horizonPercent = ((horizon - 0) / (48 - 0)) * 100;

  return (
    <main
      className="grid-bg"
      style={{ minHeight: "100vh", padding: "0 0 60px" }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid #1e2d45",
          background: "rgba(10,15,26,0.8)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
          padding: "0 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: "linear-gradient(135deg, #0ea5e9, #4ade80)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Wind size={20} color="white" />
            </div>
            <div>
              <h1
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: 18,
                  color: "#e2e8f0",
                  lineHeight: 1,
                }}
              >
                WindWatch
              </h1>
              <p style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                UK National Wind Forecast Monitor
              </p>
            </div>
          </div>

          {lastFetched && (
            <p style={{ fontSize: 11, color: "#475569" }}>
              Updated {lastFetched}
            </p>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {/* Controls Card */}
        <div
          className="animate-fade-up"
          style={{
            background: "#111827",
            border: "1px solid #1e2d45",
            borderRadius: 16,
            padding: "24px",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 24,
              alignItems: "flex-end",
            }}
          >
            {/* Date Range */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label
                  style={{
                    fontSize: 11,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Start Date
                </label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  min="2024-01-01"
                  max="2024-12-31"
                  style={{
                    background: "#0a0f1a",
                    border: "1px solid #1e2d45",
                    borderRadius: 8,
                    padding: "10px 14px",
                    color: "#e2e8f0",
                    fontSize: 14,
                    fontFamily: "'DM Sans', sans-serif",
                    outline: "none",
                    cursor: "pointer",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label
                  style={{
                    fontSize: 11,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  End Date
                </label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  min="2024-01-01"
                  max="2024-12-31"
                  style={{
                    background: "#0a0f1a",
                    border: "1px solid #1e2d45",
                    borderRadius: 8,
                    padding: "10px 14px",
                    color: "#e2e8f0",
                    fontSize: 14,
                    fontFamily: "'DM Sans', sans-serif",
                    outline: "none",
                    cursor: "pointer",
                  }}
                />
              </div>

              {/* Horizon Slider */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  minWidth: 220,
                  flex: 1,
                }}
              >
                <label
                  style={{
                    fontSize: 11,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>Forecast Horizon</span>
                  <span
                    style={{
                      color: "#0ea5e9",
                      fontFamily: "'JetBrains Mono'",
                      fontSize: 12,
                    }}
                  >
                    {horizon}h
                  </span>
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "#475569", fontSize: 11 }}>0h</span>
                  <input
                    type="range"
                    min={0}
                    max={48}
                    step={1}
                    value={horizon}
                    onChange={(e) => setHorizon(Number(e.target.value))}
                    style={
                      {
                        flex: 1,
                        "--range-progress": `${horizonPercent}%`,
                      } as React.CSSProperties
                    }
                  />
                  <span style={{ color: "#475569", fontSize: 11 }}>48h</span>
                </div>
                <p style={{ color: "#475569", fontSize: 11 }}>
                  Shows forecasts created ≥ {horizon}h before target time
                </p>
              </div>
            </div>

            {/* Fetch Button */}
            <button
              onClick={fetchData}
              disabled={loading}
              style={{
                background: loading
                  ? "#1e2d45"
                  : "linear-gradient(135deg, #0ea5e9, #0284c7)",
                color: "white",
                border: "none",
                borderRadius: 10,
                padding: "12px 24px",
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
                opacity: loading ? 0.6 : 1,
              }}
            >
              <RefreshCw
                size={16}
                style={{
                  animation: loading ? "spin 1s linear infinite" : "none",
                }}
              />
              {loading ? "Loading…" : "Load Data"}
            </button>
          </div>
        </div>

        {/* Info banner */}
        <div
          style={{
            background: "rgba(14,165,233,0.06)",
            border: "1px solid rgba(14,165,233,0.2)",
            borderRadius: 10,
            padding: "10px 16px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Info size={14} color="#0ea5e9" style={{ flexShrink: 0 }} />
          <p style={{ color: "#94a3b8", fontSize: 12, margin: 0 }}>
            Data sourced from{" "}
            <a
              href="https://bmrs.elexon.co.uk"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#0ea5e9", textDecoration: "none" }}
            >
              Elexon BMRS API
            </a>
            . Forecasts use January 2024 data with 0–48h horizon. The forecast
            horizon filter shows only the latest forecast created at least{" "}
            <strong style={{ color: "#e2e8f0" }}>{horizon} hours</strong> before
            each target time.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 12,
              padding: "16px 20px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <AlertCircle size={18} color="#ef4444" />
            <div>
              <p style={{ color: "#ef4444", fontWeight: 600, fontSize: 14 }}>
                Error loading data
              </p>
              <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 2 }}>
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div
            style={{
              background: "#111827",
              border: "1px solid #1e2d45",
              borderRadius: 16,
              height: 460,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "3px solid #1e2d45",
                borderTop: "3px solid #0ea5e9",
                animation: "spin 1s linear infinite",
              }}
            />
            <p style={{ color: "#64748b", fontSize: 14 }}>
              Fetching wind data from Elexon…
            </p>
          </div>
        )}

        {/* Chart */}
        {!loading && data && data.length > 0 && (
          <WindChart data={data} horizonHours={horizon} />
        )}

        {/* Empty state */}
        {!loading && data && data.length === 0 && (
          <div
            style={{
              background: "#111827",
              border: "1px solid #1e2d45",
              borderRadius: 16,
              height: 300,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <Wind size={40} color="#1e2d45" />
            <p style={{ color: "#475569", fontSize: 14 }}>
              No data found for the selected range
            </p>
            <p style={{ color: "#374151", fontSize: 12 }}>
              Try a different date range or lower the horizon filter
            </p>
          </div>
        )}
      </div>

      {/* Spin keyframe */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}
