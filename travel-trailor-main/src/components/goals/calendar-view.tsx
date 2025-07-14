'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import type { Goal } from '@/lib/types';
import type { ReactNode } from 'react';
import { useGoals } from '@/contexts/goal-provider';
import type { DayPicker } from 'react-day-picker';

export function CalendarView({
  children,
  goal,
}: {
  children: ReactNode;
  goal: Goal;
}) {
  const { toggleCompletion } = useGoals();
  const completedDays = goal.completions;

  const handleDayClick: DayPicker['onDayClick'] = (day, modifiers) => {
    if (day && !modifiers.disabled) {
      toggleCompletion(goal.id, day);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild id={`calendar-trigger-${goal.id}`}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{goal.name}</DialogTitle>
          <DialogDescription>
            Your progress for this goal. Click a day to mark it as complete or incomplete.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center">
          <Calendar
            mode="single"
            onDayClick={handleDayClick}
            selected={completedDays}
            modifiers={{
                completed: completedDays
            }}
            modifiersStyles={{
                completed: {
                    color: 'hsl(var(--primary-foreground))',
                    backgroundColor: 'hsl(var(--primary))'
                },
            }}
            disabled={(date) => date > new Date() || date < goal.startDate}
            className="rounded-md border"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
