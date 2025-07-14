'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plane, Sparkles, Mountain, Utensils, Landmark, ShoppingBag, Sun, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { generateItinerary } from '@/ai/flows/itinerary-generator';
import type { ItineraryOutput } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useTrips } from '@/contexts/trip-provider';

const preferences = [
    { id: "adventure", label: "Adventure", icon: Mountain },
    { id: "relaxation", label: "Relaxation", icon: Sun },
    { id: "foodie", label: "Foodie", icon: Utensils },
    { id: "culture", label: "Culture", icon: Landmark },
    { id: "shopping", label: "Shopping", icon: ShoppingBag },
];

export default function DashboardPage() {
    const [destination, setDestination] = React.useState('');
    const [startDate, setStartDate] = React.useState<Date | undefined>();
    const [endDate, setEndDate] = React.useState<Date | undefined>();
    const [selectedPreferences, setSelectedPreferences] = React.useState<string[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [generatedItinerary, setGeneratedItinerary] = React.useState<ItineraryOutput | null>(null);
    const [isAlertOpen, setIsAlertOpen] = React.useState(false);
    const { toast } = useToast();
    const { saveTrip } = useTrips();
    
    const handlePreferenceChange = (id: string) => {
        setSelectedPreferences(prev => 
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    }

    const handleGenerate = async () => {
        if (!destination || !startDate || !endDate) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please fill out the destination and both start and end dates.',
            });
            return;
        }
        setIsLoading(true);
        setGeneratedItinerary(null);
        try {
            const result = await generateItinerary({
                destination,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                preferences: selectedPreferences
            });
            setGeneratedItinerary(result);
            setIsAlertOpen(true);
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Generation Failed',
                description: 'There was an error generating your itinerary. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    }

    const handleSave = async () => {
        if (!generatedItinerary || !destination || !startDate || !endDate) {
            toast({
                variant: 'destructive',
                title: 'Cannot Save',
                description: 'No itinerary data to save.',
            });
            return;
        }
        await saveTrip({
            destination,
            startDate,
            endDate,
            preferences: selectedPreferences,
            itineraryData: generatedItinerary,
        });
        setIsAlertOpen(false);
    }

    return (
        <div className="flex justify-center items-center flex-grow p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Plane className="h-8 w-8 text-primary" />
                        <div>
                            <CardTitle className="text-2xl">Plan Your Next Adventure</CardTitle>
                            <CardDescription>Tell us about your trip, and we'll create a custom itinerary for you.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="destination">Destination</Label>
                        <Input id="destination" placeholder="e.g., Paris, France" value={destination} onChange={e => setDestination(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start-date">Start Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !startDate && "text-muted-foreground"
                                    )}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={setStartDate}
                                    initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end-date">End Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !endDate && "text-muted-foreground"
                                    )}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={setEndDate}
                                    disabled={{ before: startDate }}
                                    initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Preferences</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                            {preferences.map(pref => (
                                <div key={pref.id} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={pref.id} 
                                        onCheckedChange={() => handlePreferenceChange(pref.id)}
                                        checked={selectedPreferences.includes(pref.id)}
                                    />
                                    <Label htmlFor={pref.id} className="flex items-center gap-2 font-normal cursor-pointer">
                                        <pref.icon className="h-4 w-4" />
                                        {pref.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleGenerate} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        {isLoading ? 'Generating...' : 'Generate Itinerary'}
                    </Button>
                </CardFooter>
            </Card>

            {generatedItinerary && (
                <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                    <AlertDialogContent className="max-w-3xl">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-2xl">Your Itinerary for {destination}</AlertDialogTitle>
                            <AlertDialogDescription>
                                Here is your personalized travel plan. You can save it to view later in "My Trips".
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <ScrollArea className="h-[60vh] pr-4">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Day-by-Day Plan</h3>
                                    {generatedItinerary.itinerary.map((day, index) => (
                                        <div key={index} className="mb-4">
                                            <h4 className="font-bold">Day {day.day}: {day.title}</h4>
                                            <p className="text-sm text-muted-foreground mb-1"><b>Meals:</b> {day.mealSuggestions}</p>
                                            <ul className="list-disc list-inside text-sm">
                                                {day.activities.map((activity, i) => <li key={i}>{activity}</li>)}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                                <Separator />
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Packing List</h3>
                                    <ul className="list-disc list-inside text-sm grid grid-cols-2 gap-x-4">
                                        {generatedItinerary.packingList.map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                </div>
                                <Separator />
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Local Tips</h3>
                                     <ul className="list-disc list-inside text-sm space-y-1">
                                        {generatedItinerary.localTips.map((tip, i) => <li key={i}>{tip}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </ScrollArea>
                        <AlertDialogFooter>
                             <Button variant="outline" onClick={() => setIsAlertOpen(false)}>Close</Button>
                             <Button onClick={handleSave}>Save to My Trips</Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    );
}
