
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useGoals } from '@/contexts/goal-provider';
import { startOfDay } from 'date-fns';

export function ProgressCalendar() {
  const { goals } = useGoals();

  const completedDays = goals.reduce((acc, goal) => {
    goal.completions.forEach(compDate => {
      acc.add(startOfDay(compDate).getTime());
    });
    return acc;
  }, new Set<number>());

  const completedDates = Array.from(completedDays).map(time => new Date(time));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consistency Calendar</CardTitle>
        <CardDescription>Days you've completed at least one goal.</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Calendar
          mode="multiple"
          selected={completedDates}
          modifiers={{
            completed: completedDates,
          }}
          modifiersStyles={{
            completed: {
              color: 'hsl(var(--primary-foreground))',
              backgroundColor: 'hsl(var(--primary))',
            },
          }}
          className="rounded-md border p-3"
          showOutsideDays
        />
      </CardContent>
    </Card>
  );
}
