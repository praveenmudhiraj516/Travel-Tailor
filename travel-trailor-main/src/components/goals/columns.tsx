'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Goal } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, Edit, Calendar } from 'lucide-react';
import { useGoals } from '@/contexts/goal-provider';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '../ui/badge';
import { CalendarView } from './calendar-view';
import { GoalDialog } from './goal-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';

const ActionCell = ({ goal }: { goal: Goal }) => {
  const { deleteGoal, getStreak } = useGoals();
  const streak = getStreak(goal.id);
  
  return (
    <AlertDialog>
      <CalendarView goal={goal}>
        <GoalDialog goal={goal}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={e => {
                  e.preventDefault();
                  document.getElementById(`calendar-trigger-${goal.id}`)?.click();
                }}
              >
                <Calendar className="mr-2 h-4 w-4" />
                <span>View Progress</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={e => {
                  e.preventDefault();
                  document.getElementById(`edit-trigger-${goal.id}`)?.click();
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
        </GoalDialog>
      </CalendarView>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            goal and all of its progress.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteGoal(goal.id)}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const columns: ColumnDef<Goal>[] = [
  {
    accessorKey: 'name',
    header: 'Goal Name',
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.original.type;
      return <Badge variant="secondary" className="capitalize">{type}</Badge>;
    },
  },
  {
    accessorKey: 'startDate',
    header: 'Started',
    cell: ({ row }) => {
      const date = row.original.startDate;
      return (
        <div className="flex flex-col">
          <span>{format(date, 'MMM d, yyyy')}</span>
          <span className="text-xs text-muted-foreground">
            ({formatDistanceToNow(date, { addSuffix: true })})
          </span>
        </div>
      );
    },
  },
  {
    id: 'streak',
    header: 'Current Streak',
    cell: ({ row }) => {
      const { getStreak } = useGoals();
      return <span>{getStreak(row.original.id)} days</span>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionCell goal={row.original} />,
  },
];
