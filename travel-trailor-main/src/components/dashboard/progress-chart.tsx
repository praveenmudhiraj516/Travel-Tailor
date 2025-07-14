'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useGoals } from '@/contexts/goal-provider';
import { subDays, format, subMonths, subYears, startOfWeek, startOfMonth, isWithinInterval, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type TimeRange = 'week' | 'month' | 'year';

const ChartTooltipContent = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col space-y-1">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Period
              </span>
              <span className="font-bold text-muted-foreground">
                {label}
              </span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Completions
              </span>
              <span className="font-bold">
                {payload[0].value}
              </span>
            </div>
          </div>
        </div>
      );
    }
  
    return null;
  };

export function ProgressChart() {
  const { goals } = useGoals();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  const chartData = useMemo(() => {
    const now = new Date();
    if (timeRange === 'week') {
        const past7Days = eachDayOfInterval({
            start: subDays(now, 6),
            end: now,
        });
        return past7Days.map(date => {
            const day = format(date, 'EEE');
            const completions = goals.reduce((acc, goal) => {
              const completedOnDay = goal.completions.some(
                compDate => compDate.toDateString() === date.toDateString()
              );
              return acc + (completedOnDay ? 1 : 0);
            }, 0);
            return { name: day, completions };
          });
    }
    if (timeRange === 'month') {
        const past4Weeks = eachWeekOfInterval({
            start: subMonths(now, 1),
            end: now,
        }, { weekStartsOn: 1 });
        return past4Weeks.map((weekStart) => {
            const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
            const weekLabel = `${format(weekStart, 'MMM d')}`;
            const completions = goals.reduce((acc, goal) => {
                return acc + goal.completions.filter(c => isWithinInterval(c, {start: weekStart, end: weekEnd})).length;
            }, 0);
            return { name: weekLabel, completions};
        });
    }
    if (timeRange === 'year') {
        const past12Months = eachMonthOfInterval({
            start: subYears(now, 1),
            end: now,
        });
        return past12Months.map(monthStart => {
            const monthLabel = format(monthStart, 'MMM');
            const completions = goals.reduce((acc, goal) => {
                return acc + goal.completions.filter(c => c.getMonth() === monthStart.getMonth() && c.getFullYear() === monthStart.getFullYear()).length;
            }, 0);
            return {name: monthLabel, completions};
        });
    }
    return [];
  }, [goals, timeRange]);

  const cardTitle = {
      week: 'Weekly Progress',
      month: 'Monthly Progress',
      year: 'Yearly Progress'
  }

  const cardDescription = {
    week: 'Completions over the last 7 days.',
    month: 'Completions over the last 4 weeks.',
    year: 'Completions over the last 12 months.'
}

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>{cardTitle[timeRange]}</CardTitle>
                <CardDescription>{cardDescription[timeRange]}</CardDescription>
            </div>
            <Tabs defaultValue="week" onValueChange={(value) => setTimeRange(value as TimeRange)} className="w-auto">
                <TabsList>
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="month">Month</TabsTrigger>
                    <TabsTrigger value="year">Year</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip
                content={<ChartTooltipContent />}
                cursor={{ fill: 'hsl(var(--muted))' }}
              />
              <Bar dataKey="completions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
