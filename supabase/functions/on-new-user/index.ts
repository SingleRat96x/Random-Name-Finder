import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Initialize Supabase Admin Client
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

interface AuthHookPayload {
  type: string;
  table: string;
  record?: UserRecord;
  schema: string;
  old_record?: UserRecord;
}

interface UserRecord {
  id: string;
  email?: string;
  raw_user_meta_data?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    console.error(`Method ${req.method} not allowed`);
    return new Response(
      JSON.stringify({ error: 'Method Not Allowed' }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  try {
    // Parse the request payload
    const payload: AuthHookPayload = await req.json();
    console.log('Received Auth Hook payload:', JSON.stringify(payload, null, 2));

    // Extract user record from payload
    // Auth Hooks can have different structures depending on the event type
    let user: UserRecord;

    if (payload.record) {
      // Database webhook format (INSERT on auth.users)
      user = payload.record;
    } else if (payload.type === 'INSERT' && payload.table === 'users') {
      // Alternative webhook format
      user = payload as unknown as UserRecord;
    } else {
      // Direct user object (some Auth Hook formats)
      user = payload as unknown as UserRecord;
    }

    // Validate required user data
    if (!user || !user.id) {
      console.error('Invalid payload: missing user ID', payload);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid payload: user ID is required',
          received_payload: payload 
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Validate user ID format (should be UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(user.id)) {
      console.error('Invalid user ID format:', user.id);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid user ID format',
          user_id: user.id 
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    console.log(`Processing profile creation for user: ${user.id}`);

    // Call the Postgres function to create the user profile
    const { error: rpcError } = await supabaseAdmin.rpc('create_user_profile', {
      p_user_id: user.id,
      p_email: user.email || null,
      p_raw_user_meta_data: user.raw_user_meta_data || {},
    });

    if (rpcError) {
      console.error('Error calling create_user_profile RPC:', rpcError);
      
      // Check if this is a "profile already exists" scenario
      if (rpcError.message?.includes('unique_violation') || 
          rpcError.message?.includes('already exists')) {
        console.log(`Profile already exists for user ${user.id}, skipping creation`);
        return new Response(
          JSON.stringify({ 
            message: 'Profile already exists',
            user_id: user.id 
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      // For other errors, return 500
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create user profile',
          details: rpcError.message,
          user_id: user.id 
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    console.log(`Successfully created profile for user: ${user.id}`);
    
    return new Response(
      JSON.stringify({ 
        message: 'Profile created successfully',
        user_id: user.id,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );

  } catch (error) {
    console.error('Error in on-new-user Edge Function:', error);
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON payload',
          details: error.message 
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Handle other errors
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}); 