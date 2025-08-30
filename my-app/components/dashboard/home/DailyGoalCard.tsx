"use client";

import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, ResponsiveContainer, Cell } from "recharts";
import { formatSwissPriceWithCHF } from "@/lib/utils";

interface DailyGoalCardProps {
  currentAmount: number;
  goalAmount: number;
  percentage: number;
}

const DailyGoalCard = ({
  currentAmount,
  goalAmount,
  percentage,
}: DailyGoalCardProps) => {
  const remaining = goalAmount - currentAmount;

  // Datos para PieChart - estructura correcta para indicador de progreso
  const normalizedPercentage = Math.max(0, Math.min(100, percentage));

  const chartData = [
    {
      name: "completed",
      value: normalizedPercentage,
      fill: "#22C55F",
    },
    {
      name: "remaining",
      value: 100 - normalizedPercentage,
      fill: "#E5E5E5",
    },
  ];

  return (
    <section className="mb-6">
      <Card className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">
                Tagesziel
              </h2>
            </div>
            <button className="p-1 hover:bg-muted rounded-lg transition-colors duration-200 tap-highlight-transparent">
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="flex items-center gap-6">
            {/* Gráfico circular profesional con Recharts */}
            <div className="relative w-20 h-20 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius="70%"
                    outerRadius="85%"
                    startAngle={-190}
                    endAngle={450}
                    cornerRadius={15}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Contenido central del gráfico */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs  text-foreground flex flex-col items-center ">
                  <span className="text-[12px]">Total</span>
                  <span className="text-[14px] font-bold">{percentage}%</span>
                </span>
              </div>
            </div>

            {/* Información del objetivo mejorada */}
            <div className="flex-1 space-y-3">
              {/* Amounts */}
              <div className="space-y-1">
                <div className="text-2xl font-bold text-foreground">
                  {formatSwissPriceWithCHF(currentAmount)}
                  <span className="text-base font-normal text-muted-foreground ml-1">
                    / {formatSwissPriceWithCHF(goalAmount)}
                  </span>
                </div>
              </div>

              {/* Remaining amount */}
              {remaining > 0 && (
                <div className="text-sm text-muted-foreground flex items-center gap-2 w-[160px]">
                  <p>
                    🥳 Fast geschafft! Noch CHF{" "}
                    {formatSwissPriceWithCHF(remaining)} zum Ziel
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default DailyGoalCard;
