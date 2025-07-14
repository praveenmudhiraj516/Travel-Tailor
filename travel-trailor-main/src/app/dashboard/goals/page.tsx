'use client';

import { GoalDialog } from '@/components/goals/goal-dialog';
import { Button } from '@/components/ui/button';
import { useGoals } from '@/contexts/goal-provider';
import { DataTable } from '@/components/goals/data-table';
import { columns } from '@/components/goals/columns';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function GoalsPage() {
  const { goals, loading } = useGoals();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Your Goals</h2>
          <p className="text-muted-foreground">
            Here's a list of your current habits and goals.
          </p>
        </div>
        <GoalDialog>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Goal
          </Button>
        </GoalDialog>
      </div>
      {loading ? (
        <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <DataTable columns={columns} data={goals} />
      )}
    </div>
  );
}
