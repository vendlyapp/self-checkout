'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { useMyStore } from '@/hooks/queries/useMyStore';
import { buildApiUrl, getAuthHeaders } from '@/lib/config/api';
import { toast } from 'sonner';
import { ChevronLeft, Loader2, CheckCircle2, Calendar, CalendarRange, CalendarDays } from 'lucide-react';
import { Loader } from '@/components/ui/Loader';
import { useResponsive } from '@/hooks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { devError } from '@/lib/utils/logger';

type GoalField = 'daily' | 'weekly' | 'monthly';

const GOAL_CONFIG: { key: GoalField; label: string; placeholder: string; icon: typeof Calendar }[] = [
  { key: 'daily', label: 'Tagesziel', placeholder: '100', icon: Calendar },
  { key: 'weekly', label: 'Wochenziel', placeholder: '600', icon: CalendarRange },
  { key: 'monthly', label: 'Monatsziel', placeholder: '1500', icon: CalendarDays },
];

export default function SalesGoalsPage() {
  const queryClient = useQueryClient();
  const { isMobile } = useResponsive();
  const { data: store, isLoading: storeLoading } = useMyStore();
  const [goalDaily, setGoalDaily] = useState('');
  const [goalWeekly, setGoalWeekly] = useState('');
  const [goalMonthly, setGoalMonthly] = useState('');
  const [saving, setSaving] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const setGoal = (key: GoalField, value: string) => {
    if (key === 'daily') setGoalDaily(value);
    if (key === 'weekly') setGoalWeekly(value);
    if (key === 'monthly') setGoalMonthly(value);
  };

  useEffect(() => {
    if (!store) return;
    setGoalDaily(store.goalDaily != null ? String(store.goalDaily) : '');
    setGoalWeekly(store.goalWeekly != null ? String(store.goalWeekly) : '');
    setGoalMonthly(store.goalMonthly != null ? String(store.goalMonthly) : '');
  }, [store]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const { supabase } = await import('@/lib/supabase/client');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Sie sind nicht authentifiziert');
        setSaving(false);
        return;
      }

      const body: { goalDaily?: number | null; goalWeekly?: number | null; goalMonthly?: number | null } = {};
      if (goalDaily.trim() !== '') {
        const v = parseFloat(goalDaily.replace(',', '.'));
        if (!Number.isNaN(v) && v >= 0) body.goalDaily = v;
        else body.goalDaily = null;
      } else body.goalDaily = null;
      if (goalWeekly.trim() !== '') {
        const v = parseFloat(goalWeekly.replace(',', '.'));
        if (!Number.isNaN(v) && v >= 0) body.goalWeekly = v;
        else body.goalWeekly = null;
      } else body.goalWeekly = null;
      if (goalMonthly.trim() !== '') {
        const v = parseFloat(goalMonthly.replace(',', '.'));
        if (!Number.isNaN(v) && v >= 0) body.goalMonthly = v;
        else body.goalMonthly = null;
      } else body.goalMonthly = null;

      const response = await fetch(buildApiUrl('/api/store/my-store'), {
        method: 'PUT',
        headers: getAuthHeaders(session.access_token),
        body: JSON.stringify(body),
      });
      const result = await response.json();

      if (!response.ok) {
        const errMsg = result?.error || 'Fehler beim Speichern';
        setSaveError(errMsg);
        toast.error(errMsg);
        setSaving(false);
        return;
      }
      if (result.success) {
        await queryClient.invalidateQueries({ queryKey: ['myStore'] });
        setSuccessModalOpen(true);
        toast.success('Ziele gespeichert');
      } else {
        const errMsg = result.error || 'Fehler beim Speichern';
        setSaveError(errMsg);
        toast.error(errMsg);
      }
    } catch (err) {
      devError(err);
      const errMsg = 'Fehler beim Speichern';
      setSaveError(errMsg);
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  if (storeLoading || !store) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center p-4">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 md:max-w-xl md:mx-auto animate-page-enter">
      <div className="px-4 pt-3 pb-4 md:pt-4 md:pb-8 md:px-6">
        {/* Desktop: enlace atrás. En móvil el título va solo en HeaderNav */}
        {!isMobile && (
          <Link
            href="/sales"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground mb-5 transition-colors text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Zurück
          </Link>
        )}

        <div className="rounded-2xl bg-card border border-border/80 shadow-sm overflow-hidden min-w-0">
          <form onSubmit={handleSave} className="p-4 md:p-6">
            <div className="space-y-1">
              {GOAL_CONFIG.map(({ key, label, placeholder, icon: Icon }, i) => (
                <div key={key}>
                  <div
                    className={[
                      'rounded-xl transition-all p-3 md:p-4 min-w-0',
                      'focus-within:bg-primary/[0.06] focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-inset',
                      i < GOAL_CONFIG.length - 1 && 'mb-1',
                    ].join(' ')}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-muted/80 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <label
                          htmlFor={`goal-${key}`}
                          className="text-sm font-medium text-foreground"
                        >
                          {label}
                        </label>
                      </div>
                      <div className="flex items-center gap-2 w-full min-w-0 pl-12">
                        <span className="text-sm text-muted-foreground shrink-0 tabular-nums">CHF</span>
                        <input
                          id={`goal-${key}`}
                          type="number"
                          min="0"
                          step="1"
                          inputMode="decimal"
                          placeholder={placeholder}
                          value={key === 'daily' ? goalDaily : key === 'weekly' ? goalWeekly : goalMonthly}
                          onChange={(e) => setGoal(key, e.target.value)}
                          className="flex-1 min-w-0 h-11 px-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-colors text-base touch-target"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {saveError && (
              <div className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {saveError}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 active:scale-[0.99] transition-all disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2 touch-target shadow-sm"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Speichern...
                  </>
                ) : (
                  'Speichern'
                )}
              </button>
              <Link
                href="/sales"
                className="w-full h-11 rounded-xl border border-border font-medium text-foreground hover:bg-muted/50 flex items-center justify-center transition-colors text-sm touch-target"
              >
                Abbrechen
              </Link>
            </div>
          </form>
        </div>
      </div>

      <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
        <DialogContent
          className="w-[calc(100%-2rem)] max-w-sm rounded-2xl p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-6"
          showCloseButton={true}
        >
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-center text-base">Gespeichert</DialogTitle>
            <DialogDescription className="text-center text-sm">
              Ziele wurden aktualisiert.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-1">
            <button
              type="button"
              onClick={() => setSuccessModalOpen(false)}
              className="h-11 w-full sm:w-auto sm:min-w-[120px] px-5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors touch-target"
            >
              OK
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
