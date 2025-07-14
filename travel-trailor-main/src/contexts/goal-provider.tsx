'use client';

import type { Goal, GoalCreate } from '@/lib/types';
import { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './auth-provider';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  getDocs,
} from 'firebase/firestore';
import { isSameDay, subDays, startOfDay } from 'date-fns';

type GoalContextType = {
  goals: Goal[];
  addGoal: (goal: GoalCreate) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  toggleCompletion: (goalId: string, date: Date) => Promise<void>;
  getCompletionsForMonth: (goalId: string, month: Date) => Date[];
  getStreak: (goalId: string) => number;
  loading: boolean;
};

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export function GoalProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (!user || !db) {
      setGoals([]);
      setLoading(false);
      return;
    }

    const goalsCollection = collection(db, 'goals');
    const q = query(goalsCollection, where('userId', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, snapshot => {
      const userGoals: Goal[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          type: data.type,
          startDate: (data.startDate as Timestamp).toDate(),
          completions: data.completions.map((c: Timestamp) => c.toDate()),
          userId: data.userId,
        };
      });
      userGoals.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
      setGoals(userGoals);
      setLoading(false);
    }, (error) => {
      console.error("Firestore snapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  const addGoal = async (goalData: GoalCreate) => {
    if (!user || !db) throw new Error('User not authenticated');
    
    const newGoalData = {
      ...goalData,
      userId: user.uid,
      completions: [],
      startDate: Timestamp.fromDate(goalData.startDate),
    };

    await addDoc(collection(db, 'goals'), newGoalData);
  };

  const updateGoal = async (updatedGoal: Goal) => {
    if(!db) return;
    const { id, ...goalData } = updatedGoal;
    const goalRef = doc(db, 'goals', id);
    await updateDoc(goalRef, {
      ...goalData,
      startDate: Timestamp.fromDate(updatedGoal.startDate),
      completions: updatedGoal.completions.map(c => Timestamp.fromDate(c)),
    });
  };

  const deleteGoal = async (id: string) => {
    if(!db) return;
    await deleteDoc(doc(db, 'goals', id));
  };

  const toggleCompletion = async (goalId: string, date: Date) => {
    if(!db) return;
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const completionExists = goal.completions.some(
      compDate => isSameDay(compDate, date)
    );

    let newCompletions;
    if (completionExists) {
      newCompletions = goal.completions.filter(
        compDate => !isSameDay(compDate, date)
      );
    } else {
      newCompletions = [...goal.completions, date];
    }

    await updateDoc(doc(db, 'goals', goalId), { 
        completions: newCompletions.map(c => Timestamp.fromDate(c))
    });
  };

  const getCompletionsForMonth = useCallback(
    (goalId: string, month: Date) => {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return [];
      return goal.completions.filter(
        d => d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear()
      );
    },
    [goals]
  );

  const getStreak = useCallback(
    (goalId: string) => {
      const goal = goals.find(g => g.id === goalId);
      if (!goal || goal.completions.length === 0) return 0;
  
      const completionDates = new Set(
        goal.completions.map(d => startOfDay(d).getTime())
      );
  
      if (completionDates.size === 0) return 0;
  
      let currentStreak = 0;
      let today = startOfDay(new Date());
  
      // Check if today is a completion day
      if (completionDates.has(today.getTime())) {
        currentStreak++;
        let previousDay = subDays(today, 1);
        while (completionDates.has(previousDay.getTime())) {
          currentStreak++;
          previousDay = subDays(previousDay, 1);
        }
      } 
      // If today is not a completion, check if yesterday was
      else {
        let yesterday = subDays(today, 1);
        if (completionDates.has(yesterday.getTime())) {
          currentStreak++;
          let previousDay = subDays(yesterday, 1);
          while (completionDates.has(previousDay.getTime())) {
            currentStreak++;
            previousDay = subDays(previousDay, 1);
          }
        }
      }
      
      return currentStreak;
    },
    [goals]
  );

  const value = useMemo(
    () => ({
      goals,
      addGoal,
      updateGoal,
      deleteGoal,
      toggleCompletion,
      getCompletionsForMonth,
      getStreak,
      loading: authLoading || loading,
    }),
    [goals, authLoading, loading, getCompletionsForMonth, getStreak]
  );

  return <GoalContext.Provider value={value}>{children}</GoalContext.Provider>;
}

export const useGoals = () => {
  const context = useContext(GoalContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalProvider');
  }
  return context;
};
