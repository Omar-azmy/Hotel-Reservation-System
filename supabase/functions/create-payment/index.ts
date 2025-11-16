import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  bookingId: string;
  roomId: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  bookingReference: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
}

// Validation schema
const paymentRequestSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID"),
  roomId: z.string().uuid("Invalid room ID"),
  amount: z.number().positive("Amount must be positive").max(1000000, "Amount too large"),
  customerEmail: z.string().email("Invalid email address").max(255),
  customerName: z.string().trim().min(2).max(100),
  bookingReference: z.string().min(1).max(50),
  roomName: z.string().trim().min(1).max(200),
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    console.log("Create payment function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }

    console.log("User authenticated:", user.email);

    const requestData: PaymentRequest = await req.json();

    // Validate input data
    const validationResult = paymentRequestSchema.safeParse(requestData);
    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error.errors);
      const firstError = validationResult.error.errors[0];
      throw new Error(`Validation failed: ${firstError.message}`);
    }

    const {
      bookingId,
      roomId,
      amount,
      customerEmail,
      customerName,
      bookingReference,
      roomName,
      checkIn,
      checkOut,
    } = validationResult.data;

    console.log("Payment request received:", { bookingId, amount, bookingReference });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if a Stripe customer exists
    const customers = await stripe.customers.list({
      email: customerEmail,
      limit: 1,
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("Existing customer found:", customerId);
    } else {
      const customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
      });
      customerId = customer.id;
      console.log("New customer created:", customerId);
    }

    // Create a checkout session for one-time payment
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Hotel Booking - ${roomName}`,
              description: `Booking Reference: ${bookingReference}\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/booking-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
      cancel_url: `${req.headers.get("origin")}/booking?roomId=${roomId}`,
      metadata: {
        bookingId,
        bookingReference,
      },
    });

    console.log("Checkout session created:", session.id);

    return new Response(
      JSON.stringify({
        url: session.url,
        sessionId: session.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in create-payment function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
