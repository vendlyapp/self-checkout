'use client';

import React from 'react';
import Link from 'next/link';
import { Target, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useMyStore } from '@/hooks/queries/useMyStore';
import { useGoalRevenues } from '@/hooks/queries/useGoalRevenues';
import { formatSwissPriceWithCHF } from '@/lib/utils';

function GoalRow({
  label,
  current,
  goal,
}: {
  label: string;
  current: number;
  goal: number | null | undefined;
}) {
  const goalNum = goal != null ? Number(goal) : 0;
  const percentage = goalNum > 0 ? Math.min(100, Math.round((current / goalNum) * 100)) : 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="text-sm font-semibold text-foreground">
          {formatSwissPriceWithCHF(current)}
          {goalNum > 0 && (
            <span className="text-muted-foreground font-normal ml-1">
              / {formatSwissPriceWithCHF(goalNum)}
            </span>
          )}
        </span>
      </div>
      {goalNum > 0 && (
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}

const GoalsCard: React.FC = () => {
  const { data: store } = useMyStore();
  const { data: revenues, isLoading } = useGoalRevenues();

  const goalDaily = store?.goalDaily != null ? Number(store.goalDaily) : null;
  const goalWeekly = store?.goalWeekly != null ? Number(store.goalWeekly) : null;
  const goalMonthly = store?.goalMonthly != null ? Number(store.goalMonthly) : null;

  const revenueToday = revenues?.revenueToday ?? 0;
  const revenueWeek = revenues?.revenueWeek ?? 0;
  const revenueMonth = revenues?.revenueMonth ?? 0;

  return (
    <Card className="bg-card rounded-2xl border border-border shadow-sm transition-ios hover:shadow-md">
      <CardContent className="p-4 lg:p-6">
        <div className="flex justify-between items-center mb-4 lg:mb-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-lg lg:text-xl font-semibold text-foreground">Ziele</h3>
          </div>
          <Link
            href="/sales/goals"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/90 transition-colors"
          >
            Ziele konfigurieren
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-12 bg-muted rounded-lg" />
            <div className="h-12 bg-muted rounded-lg" />
            <div className="h-12 bg-muted rounded-lg" />
          </div>
        ) : (
          <div className="space-y-5">
            <GoalRow label="Tagesziel" current={revenueToday} goal={goalDaily} />
            <GoalRow label="Wochenziel" current={revenueWeek} goal={goalWeekly} />
            <GoalRow label="Monatsziel" current={revenueMonth} goal={goalMonthly} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalsCard;
