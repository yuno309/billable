import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCurrency, formatShortDate } from "@/lib/format";

export interface MonthlyRevenuePoint {
  month: string;
  revenue: number;
  label: string;
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

interface MonthlyRevenueChartProps {
  data: MonthlyRevenuePoint[];
  className?: string;
}

export const MonthlyRevenueChart = ({
  data,
  className,
}: MonthlyRevenueChartProps) => {
  const hasData = data.some((d) => d.revenue > 0);

  return (
    <ChartContainer
      config={chartConfig}
      className={className}
    >
      <AreaChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="hsl(var(--primary))"
              stopOpacity={0.22}
            />
            <stop
              offset="95%"
              stopColor="hsl(var(--primary))"
              stopOpacity={0.02}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
        />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          minTickGap={24}
          className="text-xs"
        />
        <YAxis
          width={52}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
          className="text-xs"
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="dot"
              labelFormatter={(_, payload) => {
                const point = payload?.[0]?.payload as
                  | MonthlyRevenuePoint
                  | undefined;
                return point?.label ? formatShortDate(point.month) : "";
              }}
              formatter={(value) => (
                <span className="font-medium tabular-nums">
                  {formatCurrency(Number(value))}
                </span>
              )}
            />
          }
        />
        <Area
          dataKey="revenue"
          type="monotone"
          stroke="hsl(var(--primary))"
          strokeWidth={2.5}
          fill="url(#fillRevenue)"
          dot={false}
          activeDot={{
            r: 4,
            strokeWidth: 2,
            stroke: "hsl(var(--background))",
          }}
          isAnimationActive={hasData}
        />
      </AreaChart>
    </ChartContainer>
  );
};
