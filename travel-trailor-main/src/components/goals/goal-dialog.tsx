
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useGoals } from '@/contexts/goal-provider';
import type { Goal } from '@/lib/types';
import type { ReactNode } from 'react';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useState } from 'react';
import { useAuth } from '@/contexts/auth-provider';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Goal name must be at least 2 characters.' }),
  type: z.enum(['daily', 'weekly', 'monthly']),
  startDate: z.date({
    required_error: 'A start date is required.',
  }),
});

type GoalFormValues = z.infer<typeof formSchema>;

export function GoalDialog({
  children,
  goal,
}: {
  children: ReactNode;
  goal?: Goal;
}) {
  const { addGoal, updateGoal } = useGoals();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const isEditMode = !!goal;

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: goal?.name ?? '',
      type: goal?.type ?? 'daily',
      startDate: goal?.startDate ?? new Date(),
    },
  });
  
  React.useEffect(() => {
    if (open && !isEditMode) {
        form.reset({
            name: '',
            type: 'daily',
            startDate: new Date()
        });
    } else if (open && isEditMode) {
        form.reset({
            name: goal.name,
            type: goal.type,
            startDate: goal.startDate,
        })
    }
  }, [open, isEditMode, goal, form]);


  const onSubmit = (data: GoalFormValues) => {
    if (!user) return; 
    if (isEditMode) {
      updateGoal({ ...goal, ...data, userId: user.uid });
    } else {
      addGoal(data);
    }
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild id={isEditMode ? `edit-trigger-${goal.id}` : undefined}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Goal' : 'Add a New Goal'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Make changes to your goal here. Click save when you're done."
              : "What's a new habit you want to build? Fill out the details below."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Read 20 pages" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a goal type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              {isEditMode ? 'Save Changes' : 'Create Goal'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
