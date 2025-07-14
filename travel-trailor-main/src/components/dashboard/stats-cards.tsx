'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGoals } from '@/contexts/goal-provider';
import { Goal, CheckCircle, TrendingUp } from 'lucide-react';
import React from 'react';

export function StatsCards() {
  const { goals, getStreak } = useGoals();

  const totalGoals = goals.length;
  const completedGoals = goals.reduce((sum, goal) => sum + goal.completions.length, 0);
  const longestStreak = Math.max(0, ...goals.map(g => getStreak(g.id)));

  const stats = [
    {
      title: 'Active Goals',
      value: totalGoals,
      icon: Goal,
    },
    {
      title: 'Total Completions',
      value: completedGoals,
      icon: CheckCircle,
    },
    {
      title: 'Best Streak',
      value: `${longestStreak} days`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map(stat => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
