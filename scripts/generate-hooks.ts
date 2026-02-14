import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiBaseUrl = process.env.OPENAI_BASE_URL;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

if (!openaiApiKey) {
    console.error('Missing OpenAI API key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const openai = new OpenAI({
    apiKey: openaiApiKey,
    baseURL: openaiBaseUrl,
});

async function generateBlurb(movie: any) {
    try {
        const prompt = `
      You are a movie enthusiast recommending a film to a friend.
      Generate a snappy, 2-sentence "Why you should watch this" hook for the movie "${movie.title}".
      
      Here is the overview: "${movie.overview}"
      Genre: "${movie.genre}"

      Rules:
      1. Do NOT sound like a generic summary.
      2. It should sound like a friend recommending it excitedly.
      3. Focus on the unique value or emotional impact.
      4. Keep it under 50 words.
    `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-4o-mini', // or whatever model is available/preferred
        });

        return completion.choices[0].message.content?.trim();
    } catch (error) {
        console.error(`Error generating blurb for ${movie.title}:`, error);
        return null;
    }
}

async function main() {
    console.log('Starting blurb generation...');

    // 1. Fetch movies without custom_blurb
    const { data: movies, error } = await supabase
        .from('movies')
        .select('*')
        .is('custom_blurb', null);

    if (error) {
        console.error('Error fetching movies:', error);
        return;
    }

    if (!movies || movies.length === 0) {
        console.log('No movies found without custom_blurb.');
        return;
    }

    console.log(`Found ${movies.length} movies to process.`);

    for (const movie of movies) {
        console.log(`Processing: ${movie.title}`);

        // Generate blurb
        const blurb = await generateBlurb(movie);

        if (blurb) {
            console.log(`Generated blurb: "${blurb}"`);

            // Update movie in Supabase
            const { error: updateError } = await supabase
                .from('movies')
                .update({ custom_blurb: blurb })
                .eq('id', movie.id);

            if (updateError) {
                console.error(`Error updating movie ${movie.title}:`, updateError);
            } else {
                console.log(`Successfully updated ${movie.title}`);
            }
        } else {
            console.log(`Skipping update for ${movie.title} as blurb generation failed.`);
        }

        // Optional: Add a small delay to avoid rate limits if necessary
        // await new Promise(resolve => setTimeout(resolve, 500)); 
    }

    console.log('Finished processing movies.');
}

main();
