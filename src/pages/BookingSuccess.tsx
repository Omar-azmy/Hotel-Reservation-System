import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BookingReceipt } from "@/components/BookingReceipt";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BookingSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const bookingId = searchParams.get("booking_id");
  const isDemo = searchParams.get("demo") === "true";
  const [verifying, setVerifying] = useState(true);
  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    const loadBooking = async () => {
      // Demo mode - direct booking confirmation (no Stripe verification needed)
      if (isDemo && bookingId) {
        try {
          const { data, error } = await supabase
            .from("bookings")
            .select(`
              *,
              rooms:room_id (
                name,
                images,
                price_per_night
              )
            `)
            .eq("id", bookingId)
            .single();

          if (error) throw error;
          setBooking(data);
          toast.success("Booking confirmed!");
          setVerifying(false);
          return;
        } catch (error) {
          console.error("Error loading booking:", error);
          toast.error("Failed to load booking details");
          navigate("/");
          return;
        }
      }

      // Stripe mode - payment verification
      if (!sessionId || !bookingId) {
        toast.error("Invalid payment session");
        navigate("/");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("verify-payment", {
          body: { sessionId, bookingId },
        });

        if (error) throw error;

        if (data.success) {
          setBooking(data.booking);
          toast.success("Payment successful! Booking confirmed.");
        } else {
          toast.error("Payment verification failed");
          navigate("/dashboard");
        }
      } catch (error: any) {
        console.error("Payment verification error:", error);
        toast.error("Failed to verify payment");
        navigate("/dashboard");
      } finally {
        setVerifying(false);
      }
    };

    loadBooking();
  }, [sessionId, bookingId, isDemo, navigate]);

  if (verifying) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h2 className="font-serif text-2xl font-bold mb-2">Verifying Payment</h2>
              <p className="text-muted-foreground">Please wait while we confirm your payment...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="font-serif text-3xl">Booking Confirmed!</CardTitle>
            <CardDescription className="text-lg">
              Your booking has been confirmed successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="receipt">Receipt</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="space-y-6 mt-6">
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Booking Reference</p>
                <p className="font-mono text-lg font-semibold">{booking.booking_reference}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Room</p>
                  <p className="font-semibold">{booking.rooms?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Guests</p>
                  <p className="font-semibold">{booking.guests}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Check-in</p>
                  <p className="font-semibold">{new Date(booking.check_in).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Check-out</p>
                  <p className="font-semibold">{new Date(booking.check_out).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Total Amount Paid</p>
                  <p className="text-2xl font-bold text-primary">${booking.total_price}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                A confirmation email with your booking details and payment receipt has been sent to{" "}
                <span className="font-semibold">{booking.customer_email}</span>
              </p>
            </div>

                <div className="flex gap-4">
                  <Button onClick={() => navigate("/dashboard")} className="flex-1">
                    View My Bookings
                  </Button>
                  <Button onClick={() => navigate("/rooms")} variant="outline" className="flex-1">
                    Browse More Rooms
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="receipt" className="mt-6">
                <BookingReceipt booking={booking} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingSuccess;
