import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wind Forecast Monitor — UK",
  description: "Monitor UK national wind power generation forecasts vs actuals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
