import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validation schema
const verifyPaymentSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  bookingId: z.string().uuid("Invalid booking ID"),
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    console.log("Verify payment function started");

    const requestData = await req.json();

    // Validate input data
    const validationResult = verifyPaymentSchema.safeParse(requestData);
    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error.errors);
      const firstError = validationResult.error.errors[0];
      throw new Error(`Validation failed: ${firstError.message}`);
    }

    const { sessionId, bookingId } = validationResult.data;
    console.log("Verifying payment for booking:", bookingId, "session:", sessionId);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log("Session status:", session.payment_status);

    if (session.payment_status === "paid") {
      // Update booking with payment information
      const { error: updateError } = await supabaseClient
        .from("bookings")
        .update({
          payment_status: "paid",
          payment_intent_id: session.payment_intent as string,
          status: "confirmed",
        })
        .eq("id", bookingId);

      if (updateError) {
        console.error("Error updating booking:", updateError);
        throw updateError;
      }

      console.log("Booking updated successfully with payment info");

      // Get booking details for confirmation email
      const { data: booking, error: bookingError } = await supabaseClient
        .from("bookings")
        .select("*, rooms(*)")
        .eq("id", bookingId)
        .single();

      if (bookingError) {
        console.error("Error fetching booking:", bookingError);
        throw bookingError;
      }

      // Send confirmation email
      try {
        const emailResponse = await supabaseClient.functions.invoke(
          "send-booking-email",
          {
            body: {
              to: booking.customer_email,
              customerName: booking.customer_name,
              bookingReference: booking.booking_reference,
              roomName: booking.rooms.name,
              checkIn: booking.check_in,
              checkOut: booking.check_out,
              guests: booking.guests,
              totalPrice: booking.total_price,
              type: "confirmation",
            },
          }
        );

        if (emailResponse.error) {
          console.error("Error sending confirmation email:", emailResponse.error);
        } else {
          console.log("Confirmation email sent successfully");
        }
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          paymentStatus: "paid",
          booking,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      // Payment not completed
      return new Response(
        JSON.stringify({
          success: false,
          paymentStatus: session.payment_status,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
  } catch (error: any) {
    console.error("Error in verify-payment function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
