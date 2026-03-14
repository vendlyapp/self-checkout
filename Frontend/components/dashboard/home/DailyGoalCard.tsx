"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PieChart, Pie, ResponsiveContainer, Cell } from "recharts";
import { formatSwissPriceWithCHF } from "@/lib/utils";
import { useMyStore } from "@/hooks/queries/useMyStore";
import { useGoalRevenues } from "@/hooks/queries/useGoalRevenues";

type GoalPeriod = "day" | "week" | "month";

const PERIOD_LABELS: Record<GoalPeriod, string> = {
  day: "Tagesziel",
  week: "Wochenziel",
  month: "Monatsziel",
};

const ROTATION_INTERVAL_MS = 15000;

export default function DailyGoalCard() {
  const { data: store } = useMyStore();
  const { data: revenues, isLoading } = useGoalRevenues();

  const [displayPeriod, setDisplayPeriod] = useState<GoalPeriod>("day");
  const [pinned, setPinned] = useState(false);

  // Metas configuradas (fallbacks si no hay valor)
  const goalDaily = store?.goalDaily != null ? Number(store.goalDaily) : 2000;
  const goalWeekly = store?.goalWeekly != null ? Number(store.goalWeekly) : 600;
  const goalMonthly = store?.goalMonthly != null ? Number(store.goalMonthly) : 1500;

  const revenueToday = revenues?.revenueToday ?? 0;
  const revenueWeek = revenues?.revenueWeek ?? 0;
  const revenueMonth = revenues?.revenueMonth ?? 0;

  const periodData = useMemo(
    () => ({
      day: { current: revenueToday, goal: goalDaily, label: PERIOD_LABELS.day },
      week: { current: revenueWeek, goal: goalWeekly, label: PERIOD_LABELS.week },
      month: { current: revenueMonth, goal: goalMonthly, label: PERIOD_LABELS.month },
    }),
    [revenueToday, revenueWeek, revenueMonth, goalDaily, goalWeekly, goalMonthly]
  );

  const { current: currentAmount, goal: goalAmount, label: periodLabel } = periodData[displayPeriod];
  const percentage = goalAmount > 0 ? Math.min(100, Math.round((currentAmount / goalAmount) * 100)) : 0;
  const remaining = goalAmount - currentAmount;
  const normalizedPercentage = Math.max(0, Math.min(100, percentage));

  // Rotación automática cada 15 s si no está fijado
  useEffect(() => {
    if (pinned) return;
    const id = setInterval(() => {
      setDisplayPeriod((prev) => (prev === "day" ? "week" : prev === "week" ? "month" : "day"));
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(id);
  }, [pinned]);

  const handlePeriodSelect = (period: GoalPeriod) => {
    setDisplayPeriod(period);
    setPinned(true);
  };

  const chartData = [
    { name: "completed", value: normalizedPercentage, fill: "#22C55E" },
    { name: "remaining", value: 100 - normalizedPercentage, fill: "#E5E7EB" },
  ];

  const salesCount = displayPeriod === "day" ? 24 : displayPeriod === "week" ? 7 : 30;
  const avgPerSale = currentAmount > 0 ? currentAmount / Math.max(1, salesCount) : 0;

  return (
    <Link
      href="/sales/goals"
      className="block w-full bg-white rounded-2xl p-4 md:p-6 lg:p-6 shadow-sm border border-gray-200/50 hover:shadow-md hover:border-gray-300/60 active:scale-[0.99] transition-all cursor-pointer"
      aria-label={`${periodLabel} konfigurieren`}
    >
      {/* Header: título + selector de periodo */}
      <div className="flex justify-between items-center mb-3 md:mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">
            {periodLabel}
          </h2>
        </div>
        <span className="p-1 hover:bg-gray-100 rounded-lg transition-ios-fast tap-highlight-transparent inline-flex" aria-hidden>
          <ChevronRight className="w-5 h-5 text-gray-500" />
        </span>
      </div>

      {/* Selector Tag | Woche | Monat - evita propagación del Link al hacer clic */}
      <div
        className="flex rounded-xl bg-gray-100 p-1 mb-4 md:mb-5"
        role="tablist"
        aria-label="Zielzeitraum wählen"
        onClick={(e) => e.preventDefault()}
      >
        {(["day", "week", "month"] as const).map((period) => (
          <button
            key={period}
            type="button"
            role="tab"
            aria-selected={displayPeriod === period}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePeriodSelect(period);
            }}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all tap-highlight-transparent ${
              displayPeriod === period
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {period === "day" ? "Tag" : period === "week" ? "Woche" : "Monat"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-4 animate-pulse">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-row items-center gap-4 md:gap-6 lg:gap-6">
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
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs md:text-sm text-gray-600 flex flex-col items-center">
                  <span className="text-[11px] md:text-[13px]">Total</span>
                  <span className="text-[13px] md:text-[16px] font-bold text-gray-900">{percentage}%</span>
                </span>
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-3 md:space-y-4">
              <div className="space-y-1">
                <div className="text-lg md:text-xl lg:text-3xl font-bold text-gray-900">
                  {formatSwissPriceWithCHF(currentAmount)}
                  <span className="text-sm md:text-base lg:text-lg font-normal text-gray-500 ml-1">
                    / {formatSwissPriceWithCHF(goalAmount)}
                  </span>
                </div>
              </div>

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

              {remaining > 0 ? (
                <div className="text-sm md:text-base text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🥳</span>
                    <p>
                      Fast geschafft! Noch{" "}
                      <span className="font-semibold text-gray-900">
                        {formatSwissPriceWithCHF(remaining)}
                      </span>{" "}
                      zum Ziel!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-sm md:text-base text-green-600 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎉</span>
                    <p>{periodLabel} erreicht!</p>
                  </div>
                </div>
              )}

              <div className="hidden md:block pt-2 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs text-gray-500">
                  <div>
                    <span className="block font-medium text-gray-900">Durchschnitt</span>
                    <span>{formatSwissPriceWithCHF(avgPerSale)} pro Verkauf</span>
                  </div>
                  <div>
                    <span className="block font-medium text-gray-900">Verbleibend</span>
                    <span>
                      {goalAmount > 0
                        ? `${Math.max(0, Math.ceil(remaining / (avgPerSale || 1)))} Verkäufe`
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Link>
  );
}
