
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History, PlaneTakeoff, Trash2 } from "lucide-react";
import { useTrips } from "@/contexts/trip-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import type { Trip } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function HistoryPage() {
  const { trips, loading, deleteTrip } = useTrips();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const TripSkeleton = () => (
    <Card className="flex flex-col sm:flex-row">
      <CardHeader className="flex-shrink-0">
        <Skeleton className="h-12 w-12 rounded-lg" />
      </CardHeader>
      <CardContent className="pt-6 sm:pt-6 w-full space-y-2">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <History className="h-8 w-8 text-primary" />
                    <div>
                        <CardTitle className="text-2xl">My Trips</CardTitle>
                        <CardDescription>A history of all your generated itineraries.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <TripSkeleton />
                    <TripSkeleton />
                  </div>
                ) : trips.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
                        <p className="text-lg font-medium">No saved trips yet!</p>
                        <p>Once you generate and save an itinerary, it will appear here.</p>
                    </div>
                ) : (
                  <div className="space-y-4">
                    {trips.map(trip => (
                      <Card key={trip.id} className="flex flex-col sm:flex-row hover:bg-muted/50 transition-colors">
                        <div onClick={() => setSelectedTrip(trip)} className="flex flex-grow cursor-pointer">
                            <CardHeader className="flex-shrink-0">
                                <div className="bg-primary/10 text-primary rounded-lg p-3 w-fit">
                                    <PlaneTakeoff className="h-8 w-8" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6 w-full">
                            <h3 className="text-lg font-semibold">{trip.destination}</h3>
                            <p className="text-sm text-muted-foreground">
                                {format(trip.startDate, 'MMM d, yyyy')} - {format(trip.endDate, 'MMM d, yyyy')}
                            </p>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {trip.preferences.map(pref => (
                                <Badge key={pref} variant="secondary" className="capitalize">{pref}</Badge>
                                ))}
                            </div>
                            </CardContent>
                        </div>
                        <div className="flex items-center pr-6 pb-4 sm:pb-0">
                           <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your
                                    itinerary for {trip.destination}.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => deleteTrip(trip.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Delete
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                            </AlertDialog>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
            </CardContent>
        </Card>
        
        {selectedTrip && (
            <AlertDialog open={!!selectedTrip} onOpenChange={(isOpen) => !isOpen && setSelectedTrip(null)}>
                <AlertDialogContent className="max-w-3xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl">Your Itinerary for {selectedTrip.destination}</AlertDialogTitle>
                        <AlertDialogDescription>
                            Here is your saved travel plan. Enjoy your trip!
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <ScrollArea className="h-[60vh] pr-4">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Day-by-Day Plan</h3>
                                {selectedTrip.itineraryData.itinerary.map((day, index) => (
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
                                    {selectedTrip.itineraryData.packingList.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                            <Separator />
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Local Tips</h3>
                                 <ul className="list-disc list-inside text-sm space-y-1">
                                    {selectedTrip.itineraryData.localTips.map((tip, i) => <li key={i}>{tip}</li>)}
                                </ul>
                            </div>
                        </div>
                    </ScrollArea>
                    <AlertDialogFooter>
                         <Button variant="outline" onClick={() => setSelectedTrip(null)}>Close</Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )}
    </div>
  );
}
