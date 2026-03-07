import { useState } from "react";
import { generatePriceHistory } from "@/lib/storage";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useI18n } from "@/lib/i18n";

const PriceChart = () => {
  const [period, setPeriod] = useState<"today" | "yesterday">("today");
  const { t } = useI18n();

  const todayData = generatePriceHistory(24);
  const yesterdayData = generatePriceHistory(48).slice(0, 25);

  const data = period === "today" ? todayData : yesterdayData;
  const currentPrice = todayData[todayData.length - 1]?.price || 0;
  const prevPrice = todayData[todayData.length - 2]?.price || 0;
  const change = currentPrice - prevPrice;
  const changePercent = ((change / prevPrice) * 100).toFixed(2);

  return (
    <div className="space-y-4">
      {/* Live price banner */}
      <div className="glass-strong rounded-2xl p-6 flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">
            {t("chart.livePrice")}
          </p>
          <h2 className="font-display text-3xl font-bold text-gradient-gold">
            ₹{currentPrice.toFixed(2)}
          </h2>
        </div>
        <div
          className={`text-right ${change >= 0 ? "text-primary" : "text-destructive"}`}
        >
          <p className="font-display text-lg font-bold">
            {change >= 0 ? "+" : ""}₹{change.toFixed(2)}
          </p>
          <p className="text-sm">
            ({change >= 0 ? "+" : ""}
            {changePercent}%)
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-strong rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-sm font-semibold text-foreground">
            {t("chart.priceChart")}
          </h3>
          <div className="flex gap-2">
            {(["today", "yesterday"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                  period === p
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p === "today" ? t("chart.today") : t("chart.yesterday")}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsla(150, 20%, 18%, 0.5)"
              />
              <XAxis
                dataKey="time"
                stroke="hsl(150, 10%, 55%)"
                tick={{ fontSize: 10 }}
                interval={Math.floor(data.length / 6)}
              />
              <YAxis
                stroke="hsl(150, 10%, 55%)"
                tick={{ fontSize: 10 }}
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  background: "hsla(160, 25%, 10%, 0.9)",
                  border: "1px solid hsla(150, 30%, 25%, 0.4)",
                  borderRadius: "8px",
                  backdropFilter: "blur(10px)",
                  color: "hsl(150, 20%, 90%)",
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="hsl(150, 60%, 40%)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "hsl(45, 90%, 55%)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PriceChart;
