import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create admin user
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email: "admin@cybersafe.com",
      password: "Admin@123",
      email_confirm: true,
      user_metadata: {
        full_name: "Admin User",
        role: "admin",
      },
    });

    if (adminError) {
      console.error("Admin creation error:", adminError);
    }

    // Create citizen user
    const { data: citizenData, error: citizenError } = await supabase.auth.admin.createUser({
      email: "user@cybersafe.com",
      password: "User@123",
      email_confirm: true,
      user_metadata: {
        full_name: "Citizen User",
        role: "citizen",
      },
    });

    if (citizenError) {
      console.error("Citizen creation error:", citizenError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        admin: adminData ? { id: adminData.user?.id, email: adminData.user?.email } : null,
        citizen: citizenData ? { id: citizenData.user?.id, email: citizenData.user?.email } : null,
        errors: {
          admin: adminError?.message,
          citizen: citizenError?.message,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
