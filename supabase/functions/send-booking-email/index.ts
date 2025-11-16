import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingEmailRequest {
  to: string;
  customerName: string;
  bookingReference: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  type: "confirmation" | "cancellation";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the request
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.error("Authentication failed:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.email);

    const { 
      to, 
      customerName, 
      bookingReference, 
      roomName, 
      checkIn, 
      checkOut, 
      guests, 
      totalPrice, 
      type 
    }: BookingEmailRequest = await req.json();

    // Verify the user owns this booking
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .select("customer_id")
      .eq("booking_reference", bookingReference)
      .single();

    if (bookingError || !booking) {
      console.error("Booking not found:", bookingError);
      return new Response(
        JSON.stringify({ error: "Booking not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (booking.customer_id !== user.id) {
      console.error("User does not own this booking");
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending ${type} email to ${to} for booking ${bookingReference}`);

    const isConfirmation = type === "confirmation";
    const subject = isConfirmation 
      ? `Booking Confirmation - ${bookingReference}` 
      : `Booking Cancellation - ${bookingReference}`;

    const html = isConfirmation 
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a1a1a; border-bottom: 3px solid #d4af37; padding-bottom: 10px;">
            Booking Confirmed ✓
          </h1>
          <p style="font-size: 16px; color: #333;">Dear ${customerName},</p>
          <p style="font-size: 14px; color: #666;">
            Thank you for choosing our hotel! Your reservation has been confirmed and your payment has been processed successfully.
          </p>
          
          <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
            <p style="margin: 0; color: #2e7d32; font-weight: bold;">✓ Payment Received</p>
            <p style="margin: 5px 0 0 0; color: #2e7d32; font-size: 14px;">Your payment of $${totalPrice.toFixed(2)} has been successfully processed.</p>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1a1a1a; margin-top: 0;">Booking Details</h2>
            <table style="width: 100%; font-size: 14px; color: #333;">
              <tr>
                <td style="padding: 8px 0;"><strong>Booking Reference:</strong></td>
                <td style="padding: 8px 0;">${bookingReference}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Room:</strong></td>
                <td style="padding: 8px 0;">${roomName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Check-in:</strong></td>
                <td style="padding: 8px 0;">${new Date(checkIn).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Check-out:</strong></td>
                <td style="padding: 8px 0;">${new Date(checkOut).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Guests:</strong></td>
                <td style="padding: 8px 0;">${guests}</td>
              </tr>
              <tr style="border-top: 2px solid #d4af37;">
                <td style="padding: 8px 0;"><strong>Total Amount Paid:</strong></td>
                <td style="padding: 8px 0; font-size: 18px; color: #4caf50;"><strong>$${totalPrice.toFixed(2)}</strong></td>
              </tr>
            </table>
          </div>

          <p style="font-size: 14px; color: #666;">
            Check-in time is 2:00 PM and check-out time is 11:00 AM.<br>
            If you need to modify or cancel your reservation, please use your booking reference.
          </p>

          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            We look forward to welcoming you!<br><br>
            <strong>City Business Hotel</strong><br>
            Your Comfort, Our Priority
          </p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a1a1a; border-bottom: 3px solid #d4af37; padding-bottom: 10px;">
            Booking Cancelled
          </h1>
          <p style="font-size: 16px; color: #333;">Dear ${customerName},</p>
          <p style="font-size: 14px; color: #666;">
            Your reservation has been successfully cancelled as requested.
          </p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1a1a1a; margin-top: 0;">Cancelled Booking Details</h2>
            <table style="width: 100%; font-size: 14px; color: #333;">
              <tr>
                <td style="padding: 8px 0;"><strong>Booking Reference:</strong></td>
                <td style="padding: 8px 0;">${bookingReference}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Room:</strong></td>
                <td style="padding: 8px 0;">${roomName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Check-in:</strong></td>
                <td style="padding: 8px 0;">${new Date(checkIn).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Check-out:</strong></td>
                <td style="padding: 8px 0;">${new Date(checkOut).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 14px; color: #666;">
            If you cancelled by mistake or would like to make a new reservation, please visit our website.
          </p>

          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            We hope to serve you in the future.<br><br>
            <strong>City Business Hotel</strong><br>
            Your Comfort, Our Priority
          </p>
        </div>
      `;

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "City Business Hotel <onboarding@resend.dev>",
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    const data = await emailResponse.json();

    if (!emailResponse.ok) {
      throw new Error(data.message || 'Failed to send email');
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
