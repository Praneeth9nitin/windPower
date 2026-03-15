export interface ActualDataPoint {
  startTime: string;
  generation: number;
}

export interface ForecastDataPoint {
  startTime: string;
  publishTime: string;
  generation: number;
}

export interface ChartDataPoint {
  time: string;
  actual: number | null;
  forecast: number | null;
  timestamp: number;
}

export async function fetchActuals(
  from: string,
  to: string
): Promise<ActualDataPoint[]> {
  const url = new URL(
    "https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream"
  );
  url.searchParams.set("settlementDateFrom", from);
  url.searchParams.set("settlementDateTo", to);
  url.searchParams.set("fuelType", "WIND");
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Actuals API error: ${res.status}`);

  const data = await res.json();

  const records: ActualDataPoint[] = [];
  const items = Array.isArray(data) ? data : data?.data ?? [];

  for (const item of items) {
    if (item.fuelType === "WIND" || !item.fuelType) {
      records.push({
        startTime: item.startTime,
        generation: Number(item.generation),
      });
    }
  }

  return records;
}

export async function fetchForecasts(
  from: string,
  to: string
): Promise<ForecastDataPoint[]> {
  const url = new URL(
    "https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR/stream"
  );
  url.searchParams.set("publishDateTimeFrom", `${from}T00:00:00Z`);
  url.searchParams.set("publishDateTimeTo", `${to}T23:59:59Z`);
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Forecasts API error: ${res.status}`);

  const data = await res.json();
  const items = Array.isArray(data) ? data : data?.data ?? [];

  const records: ForecastDataPoint[] = items.map((item: Record<string, unknown>) => ({
    startTime: item.startTime as string,
    publishTime: item.publishTime as string,
    generation: Number(item.generation),
  }));

  return records.filter((r) => {
    const horizonHrs =
      (new Date(r.startTime).getTime() - new Date(r.publishTime).getTime()) /
      3_600_000;
    return horizonHrs >= 0 && horizonHrs <= 48;
  });
}

export function applyHorizonFilter(
  forecasts: ForecastDataPoint[],
  horizonHours: number
): Map<string, number> {
  const byTarget = new Map<string, ForecastDataPoint[]>();

  for (const f of forecasts) {
    const key = f.startTime;
    if (!byTarget.has(key)) byTarget.set(key, []);
    byTarget.get(key)!.push(f);
  }

  const result = new Map<string, number>();

  for (const [targetTime, preds] of byTarget.entries()) {
    const targetTs = new Date(targetTime).getTime();
    const cutoff = targetTs - horizonHours * 3_600_000;

    const valid = preds.filter(
      (f: any) => new Date(f.publishTime).getTime() <= cutoff
    );

    if (valid.length === 0) continue;

    valid.sort(
      (a: any, b: any) =>
        new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime()
    );

    result.set(targetTime, valid[0].generation);
  }

  return result;
}

export function buildChartData(
  actuals: ActualDataPoint[],
  forecastMap: Map<string, number>
): ChartDataPoint[] {
  const allTimes = new Set<string>();
  actuals.forEach((a) => allTimes.add(a.startTime));
  forecastMap.forEach((_, t) => allTimes.add(t));

  const actualMap = new Map(actuals.map((a) => [a.startTime, a.generation]));

  const points: ChartDataPoint[] = Array.from(allTimes)
    .map((t) => ({
      time: t,
      timestamp: new Date(t).getTime(),
      actual: actualMap.get(t) ?? null,
      forecast: forecastMap.get(t) ?? null,
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  return points;
}

export function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatShortTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
