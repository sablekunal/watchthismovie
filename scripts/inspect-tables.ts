import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!);

async function main() {
    console.log("Checking for 'genres' relation on 'movies'...");

    // Try to fetch movies with genres relation as seen in recommendationEngine.ts
    const { data: interactionData, error: interactionError } = await supabase
        .from('movies')
        .select('id, title, genres(*)') // Try selecting genres relation
        .limit(1);

    if (interactionError) {
        console.log("Relation specific error:", interactionError.message);
        // Try singular?
        const { error: singularError } = await supabase.from('movies').select('id, title, genre(*)').limit(1);
        if (singularError) console.log("Singular relation error:", singularError.message);
    } else {
        console.log("Found via relation!", JSON.stringify(interactionData, null, 2));
        return; // Success!
    }

    // Fallback: Check information schema
    // Note: Service role key might not have permission to access information_schema in some setups, but usually does.
    // We can't query information_schema directly via JS client .from() usually, 
    // but we can try an RPC if one exists, or just guess more tables.

    const tables = ['genre', 'Genres', 'MovieGenres', 'movie_genre', 'tags'];
    for (const t of tables) {
        const { error } = await supabase.from(t).select('*').limit(1);
        if (!error) console.log(`Table '${t}' exists!`);
    }
}

main();
