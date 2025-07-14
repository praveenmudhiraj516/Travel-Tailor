'use server';

/**
 * @fileOverview A flow to generate a travel itinerary based on user preferences.
 * 
 * - generateItinerary - A function that generates a travel plan.
 */

import { ai } from '@/ai/genkit';
import { ItineraryInputSchema, ItineraryOutputSchema, type ItineraryInput, type ItineraryOutput } from '@/lib/types';


export async function generateItinerary(input: ItineraryInput): Promise<ItineraryOutput> {
    return itineraryGeneratorFlow(input);
}

const prompt = ai.definePrompt({
    name: 'itineraryGeneratorPrompt',
    input: { schema: ItineraryInputSchema },
    output: { schema: ItineraryOutputSchema },
    prompt: `You are an expert travel agent. A user is asking for a personalized travel itinerary.

    **User Input:**
    - **Destination:** {{destination}}
    - **Dates:** {{startDate}} to {{endDate}}
    - **Preferences:** {{#each preferences}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

    **Your Task:**
    Create a detailed, day-by-day travel plan based on the user's input.
    - The itinerary should be practical and well-paced.
    - Include a suggested packing list tailored to the destination and planned activities.
    - Provide a few helpful local tips (e.g., transportation, etiquette, must-try local experiences).

    Generate the response in the required JSON format.
    `,
});

const itineraryGeneratorFlow = ai.defineFlow(
    {
        name: 'itineraryGeneratorFlow',
        inputSchema: ItineraryInputSchema,
        outputSchema: ItineraryOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
