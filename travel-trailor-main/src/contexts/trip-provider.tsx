
'use client';

import type { Trip, ItineraryOutput } from '@/lib/types';
import { createContext, useContext, useState, useMemo, useEffect, ReactNode } from 'react';
import { useAuth } from './auth-provider';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  doc,
  Timestamp,
  deleteDoc,
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

type TripContextType = {
  trips: Trip[];
  saveTrip: (tripData: {
    destination: string,
    startDate: Date,
    endDate: Date,
    preferences: string[],
    itineraryData: ItineraryOutput
  }) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  loading: boolean;
};

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (!user || !db) {
      setTrips([]);
      setLoading(false);
      return;
    }

    const tripsCollection = collection(db, 'trips');
    const q = query(
      tripsCollection,
      where('userId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, snapshot => {
      const userTrips: Trip[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          destination: data.destination,
          startDate: (data.startDate as Timestamp).toDate(),
          endDate: (data.endDate as Timestamp).toDate(),
          preferences: data.preferences,
          itineraryData: data.itineraryData,
          createdAt: (data.createdAt as Timestamp).toDate(),
        };
      });
      userTrips.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setTrips(userTrips);
      setLoading(false);
    }, (error) => {
      console.error("Firestore snapshot error:", error);
      toast({
        variant: 'destructive',
        title: 'Error loading trips',
        description: 'Could not fetch your saved trips. Please try again later.',
      })
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, toast]);

  const saveTrip = async (tripData: {
    destination: string,
    startDate: Date,
    endDate: Date,
    preferences: string[],
    itineraryData: ItineraryOutput
  }) => {
    if (!user || !db) throw new Error('User not authenticated');
    
    const newTripData = {
      ...tripData,
      userId: user.uid,
      createdAt: Timestamp.now(),
      startDate: Timestamp.fromDate(tripData.startDate),
      endDate: Timestamp.fromDate(tripData.endDate),
    };

    try {
      await addDoc(collection(db, 'trips'), newTripData);
      toast({
        title: 'Trip Saved!',
        description: `Your itinerary for ${tripData.destination} has been saved to "My Trips".`,
      });
    } catch (error) {
        console.error("Error saving trip:", error);
        toast({
            variant: 'destructive',
            title: 'Save Failed',
            description: 'There was an error saving your trip. Please try again.',
        });
    }
  };

  const deleteTrip = async (id: string) => {
    if (!db) return;
    try {
        await deleteDoc(doc(db, 'trips', id));
        toast({
            title: 'Trip Deleted',
            description: 'The itinerary has been successfully deleted.',
        });
    } catch (error) {
        console.error("Error deleting trip: ", error);
        toast({
            variant: 'destructive',
            title: 'Delete Failed',
            description: 'There was an error deleting your trip. Please try again.',
        });
    }
  }

  const value = useMemo(
    () => ({
      trips,
      saveTrip,
      deleteTrip,
      loading: authLoading || loading,
    }),
    [trips, authLoading, loading]
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export const useTrips = () => {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrips must be used within a TripProvider');
  }
  return context;
};
