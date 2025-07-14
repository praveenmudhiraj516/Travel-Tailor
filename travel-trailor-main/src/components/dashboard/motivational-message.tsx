'use client';

import { generateMotivationalMessage } from '@/ai/flows/motivational-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useGoals } from '@/contexts/goal-provider';
import { useAuth } from '@/contexts/auth-provider';
import { Sparkles, Bot } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function MotivationalMessage() {
  const { goals } = useGoals();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const goalsAchieved = goals.reduce((acc, goal) => acc + goal.completions.length, 0);
  // A simple mock streak, for a real app this would be more complex
  const currentStreak = goals.length > 0 ? 5 : 0; 

  const handleGenerateMessage = async () => {
    if (!user) return;
    setIsLoading(true);
    setMessage('');
    try {
      const result = await generateMotivationalMessage({
        userName: user.displayName || 'User',
        goalsAchieved,
        goalsTotal: goals.length,
        currentStreak,
      });
      setMessage(result.message);
    } catch (error) {
      console.error('Failed to generate message:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate a motivational message. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Your AI Motivator</CardTitle>
        <CardDescription>Get a personalized boost from your AI coach.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Bot className="h-8 w-8 animate-bounce" />
            <p>Generating your message...</p>
          </div>
        ) : message ? (
          <blockquote className="border-l-2 border-primary pl-4 italic text-center">
            "{message}"
          </blockquote>
        ) : (
          <div className="text-center text-muted-foreground">
            <p>Ready for some encouragement?</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerateMessage} disabled={isLoading || !user} className="w-full">
          <Sparkles className="mr-2 h-4 w-4" />
          {isLoading ? 'Thinking...' : 'Inspire Me'}
        </Button>
      </CardFooter>
    </Card>
  );
}