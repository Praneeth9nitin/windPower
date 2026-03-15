# WindWatch — UK Wind Forecast Monitor

A forecast monitoring app for UK national wind power generation, comparing actual vs. forecasted values from the [Elexon BMRS API](https://bmrs.elexon.co.uk).

> **Note:** AI tools (Claude) were used to assist in building this application.

## Features

- 📅 Select any date range to visualize wind data
- 📊 Interactive chart with actual (blue) vs. forecast (green dashed) generation
- ⏱️ Configurable forecast horizon slider (0–48h)
- 📈 Live stats: MAE, RMSE, peak generation, forecast coverage
- 📱 Fully responsive (mobile + desktop)

## Files & Directories

```
/
├── app/
│   ├── api/wind-data/route.ts   # Server-side API proxy to Elexon
│   ├── globals.css              # Global styles + fonts
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main page (controls + chart)
├── components/
│   └── WindChart.tsx            # Recharts line chart + stat cards
├── lib/
│   ├── elexon.ts                # API fetching + data processing logic
│   └── stats.ts                 # MAE, RMSE, coverage calculations
├── notebooks/
│   ├── 01_forecast_error_analysis.ipynb
│   └── 02_wind_reliability.ipynb
└── README.md
```

## How to Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo to [vercel.com](https://vercel.com) for automatic deployments.

## Live App

https://wind-power-git-main-praneeth9nitins-projects.vercel.app/

## Data Sources

- **Actuals**: `FUELHH` endpoint — half-hourly fuel generation by type (WIND)
- **Forecasts**: `WINDFOR` endpoint — wind generation forecasts with publish time

The horizon filter logic: for each target time T, only forecasts published before `T - horizonHours` are considered. The latest such forecast is plotted.

## AI Usage

AI tools (Claude) were used to assist in building the design of the application and also doing the stats calculations.
