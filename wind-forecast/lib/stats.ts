import { ChartDataPoint } from "./elexon";

export interface Stats {
  mae: number;
  rmse: number;
  actualPeak: number;
  forecastPeak: number;
  coverage: number;
}

export function computeStats(data: ChartDataPoint[]): Stats | null {
  const paired = data.filter(
    (d) => d.actual !== null && d.forecast !== null
  ) as { actual: number; forecast: number; time: string; timestamp: number }[];

  if (paired.length === 0) return null;

  const errors = paired.map((d) => d.forecast - d.actual);
  const absErrors = errors.map(Math.abs);
  const squaredErrors = errors.map((e) => e * e);

  const mae = absErrors.reduce((s, e) => s + e, 0) / absErrors.length;
  const rmse = Math.sqrt(
    squaredErrors.reduce((s, e) => s + e, 0) / squaredErrors.length
  );

  const actualPoints = data.filter((d) => d.actual !== null);
  const actualPeak = Math.max(...actualPoints.map((d) => d.actual as number));
  const forecastPoints = data.filter((d) => d.forecast !== null);
  const forecastPeak = Math.max(...forecastPoints.map((d) => d.forecast as number));

  const coverage = Math.round((paired.length / actualPoints.length) * 100);

  return { mae, rmse, actualPeak, forecastPeak, coverage };
}
