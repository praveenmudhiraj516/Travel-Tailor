import { z } from 'zod';

export type Goal = {
  id: string;
  userId: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  completions: Date[];
};

export type GoalCreate = Omit<Goal, 'id' | 'userId' | 'completions'>;

// Itinerary Schemas and Types
export const ItineraryInputSchema = z.object({
    destination: z.string().describe('The travel destination.'),
    startDate: z.string().describe('The start date of the trip in ISO format.'),
    endDate: z.string().describe('The end date of the trip in ISO format.'),
    preferences: z.array(z.string()).describe('A list of user preferences, e.g., "adventure", "relaxation".'),
  });
export type ItineraryInput = z.infer<typeof ItineraryInputSchema>;
  
const DayPlanSchema = z.object({
      day: z.number().describe('The day number of the itinerary (e.g., 1).'),
      title: z.string().describe('A catchy title for the day\'s plan (e.g., "Eiffel Tower & Louvre Museum").'),
      activities: z.array(z.string()).describe('A list of activities for the day.'),
      mealSuggestions: z.string().describe('Suggestions for meals (breakfast, lunch, dinner).'),
});
  
export const ItineraryOutputSchema = z.object({
    itinerary: z.array(DayPlanSchema).describe('A day-by-day itinerary.'),
    packingList: z.array(z.string()).describe('A suggested packing list based on the destination and activities.'),
    localTips: z.array(z.string()).describe('Useful local tips for the traveler.'),
});
export type ItineraryOutput = z.infer<typeof ItineraryOutputSchema>;

// Represents a saved trip in Firestore
export type Trip = {
    id: string;
    userId: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    preferences: string[];
    itineraryData: ItineraryOutput;
    createdAt: Date;
};