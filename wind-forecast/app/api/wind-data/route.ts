import { NextRequest, NextResponse } from "next/server";
import {
  fetchActuals,
  fetchForecasts,
  applyHorizonFilter,
  buildChartData,
} from "@/lib/elexon";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const horizon = Number(searchParams.get("horizon") ?? "4");

  if (!from || !to) {
    return NextResponse.json({ error: "Missing from/to params" }, { status: 400 });
  }

  try {
    const [actuals, forecasts] = await Promise.all([
      fetchActuals(from, to),
      fetchForecasts(from, to),
    ]);

    const forecastMap = applyHorizonFilter(forecasts, horizon);
    const chartData = buildChartData(actuals, forecastMap);

    return NextResponse.json({ chartData }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch data from Elexon API" },
      { status: 500 }
    );
  }
}
