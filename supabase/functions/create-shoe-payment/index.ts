import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Shoe price mapping
const SHOE_PRICES: Record<string, string> = {
  avalon: "price_1SmZpaLEpWzr30v1YHRWDb7X",
  zeus: "price_1SmZpqLEpWzr30v1Y48IizRK",
  woodblas: "price_1SmZpwLEpWzr30v1R7RlDsVN",
  energy: "price_1SmZpyLEpWzr30v1cgeJ5tDj",
  infinity: "price_1SmZpzLEpWzr30v15u7RNLO3",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { shoeId } = await req.json();
    console.log("Received shoeId:", shoeId);
    
    if (!shoeId || !SHOE_PRICES[shoeId]) {
      throw new Error("Invalid shoe ID");
    }

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("Missing authorization header");
    }

    // Create Supabase client with auth header
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Validate JWT and get claims
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getUser(token);
    
    if (claimsError || !claimsData?.user) {
      console.error("Auth error:", claimsError);
      throw new Error("User not authenticated");
    }

    const user = claimsData.user;
    console.log("Authenticated user:", user.id, user.email);

    if (!user.email) {
      throw new Error("User email not available");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }
    console.log("Stripe customer:", customerId || "new customer");

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: SHOE_PRICES[shoeId],
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/shop?success=true&shoe=${shoeId}`,
      cancel_url: `${req.headers.get("origin")}/shop?canceled=true`,
      metadata: {
        shoeId,
        userId: user.id,
      },
    });

    console.log("Checkout session created:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
