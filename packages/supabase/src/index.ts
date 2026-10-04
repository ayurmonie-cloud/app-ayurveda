import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from './database.types';

export type { Database, Enums, Json, Tables, TablesInsert, TablesUpdate } from './database.types';
export { Constants } from './database.types';

/** Client Supabase typé avec le schéma de la base, pour l'app comme pour l'admin. */
export type TypedSupabaseClient = SupabaseClient<Database>;
