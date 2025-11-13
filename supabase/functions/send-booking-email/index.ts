import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
            Thank you for choosing our hotel! Your reservation has been confirmed.
          </p>
          
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
              <tr>
                <td style="padding: 8px 0;"><strong>Total Amount:</strong></td>
                <td style="padding: 8px 0; font-size: 18px; color: #d4af37;"><strong>$${totalPrice.toFixed(2)}</strong></td>
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

    const emailResponse = await resend.emails.send({
      from: "City Business Hotel <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
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
