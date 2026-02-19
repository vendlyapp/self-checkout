"use client";

import { ChevronRight } from "lucide-react";
import { PieChart, Pie, ResponsiveContainer, Cell } from "recharts";
import { formatSwissPriceWithCHF, formatSwissPrice } from "@/lib/utils";

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
    <div className="w-full bg-white rounded-2xl p-4 md:p-6 lg:p-6 shadow-sm border border-gray-200/50">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 md:mb-6 lg:mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">
            Tagesziel
          </h2>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded-lg transition-ios-fast tap-highlight-transparent" aria-label="Tagesziel Details">
          <ChevronRight className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Layout responsive */}
      <div className="flex flex-row items-center gap-4 md:gap-6 lg:gap-6">
        {/* Gráfico circular - tamaño responsivo */}
        <div className="relative w-20 h-20 md:w-[88px] md:h-[88px] lg:w-24 lg:h-24 flex-shrink-0 min-w-[80px] min-h-[80px]">
          <ResponsiveContainer width="100%" height="100%" minHeight={80}>
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
            <span className="text-xs md:text-sm text-gray-600 flex flex-col items-center">
              <span className="text-[11px] md:text-[13px]">Total</span>
              <span className="text-[13px] md:text-[16px] font-bold text-gray-900">{percentage}%</span>
            </span>
          </div>
        </div>

        {/* Información del objetivo */}
        <div className="flex-1 min-w-0 space-y-3 md:space-y-4">
          <div className="space-y-1">
            <div className="text-lg md:text-xl lg:text-3xl font-bold text-gray-900">
              {formatSwissPriceWithCHF(currentAmount)}
              <span className="text-sm md:text-base lg:text-lg font-normal text-gray-500 ml-1">
                / {formatSwissPriceWithCHF(goalAmount)}
              </span>
            </div>
          </div>

          {/* Progress bar: tablet + desktop */}
          <div className="hidden md:block">
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${normalizedPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{formatSwissPriceWithCHF(0)}</span>
              <span>{formatSwissPriceWithCHF(goalAmount)}</span>
            </div>
          </div>

          {/* Remaining amount */}
          {remaining > 0 ? (
            <div className="text-sm md:text-base text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-lg">🥳</span>
                <p>
                  Fast geschafft! Noch <span className="font-semibold text-gray-900">
                    {formatSwissPriceWithCHF(remaining)}
                  </span> zum Ziel!
                </p>
              </div>
            </div>
          ) : (
            <div className="text-sm md:text-base text-green-600 font-medium">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎉</span>
                <p>Tagesziel erreicht!</p>
              </div>
            </div>
          )}

          {/* Información adicional: tablet + desktop */}
          <div className="hidden md:block pt-2 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs text-gray-500">
              <div>
                <span className="block font-medium text-gray-900">Durchschnitt</span>
                <span>{formatSwissPriceWithCHF(currentAmount / 24)} pro Verkauf</span>
              </div>
              <div>
                <span className="block font-medium text-gray-900">Verbleibend</span>
                <span>{Math.max(0, 24 - Math.floor(currentAmount / 65.83))} Verkäufe</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyGoalCard;
