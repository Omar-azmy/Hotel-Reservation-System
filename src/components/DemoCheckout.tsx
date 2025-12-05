import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Lock, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const DemoCheckout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const amount = searchParams.get("amount");
  const roomName = searchParams.get("room_name");
  const checkIn = searchParams.get("check_in");
  const checkOut = searchParams.get("check_out");

  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvc, setCvc] = useState("123");

  const handleDemoPayment = async () => {
    if (!bookingId) {
      toast.error("Invalid booking");
      return;
    }

    setProcessing(true);

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      // Update booking to confirmed
      const { data: updatedBooking, error } = await supabase
        .from("bookings")
        .update({
          payment_status: "paid",
          status: "confirmed",
          payment_intent_id: `demo_pi_${Date.now()}`,
        })
        .eq("id", bookingId)
        .select()
        .single();

      if (error) {
        console.error("Update error:", error);
        throw error;
      }

      if (!updatedBooking) {
        throw new Error("Booking not found");
      }

      toast.success("Payment successful!");
      
      // Redirect to success page with demo flag
      navigate(`/booking-success?booking_id=${bookingId}&demo=true`, { replace: true });
    } catch (error: any) {
      console.error("Demo payment error:", error);
      toast.error("Payment failed");
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    navigate("/rooms");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="font-serif text-2xl">Secure Checkout</CardTitle>
          <CardDescription>Demo Payment (No real charges)</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Order Summary */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <h3 className="font-semibold">{roomName || "Hotel Booking"}</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Check-in: {checkIn}</p>
              <p>Check-out: {checkOut}</p>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-accent">${amount || "0"}</span>
              </div>
            </div>
          </div>

          {/* Demo Card Form */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-500/10 p-3 rounded-lg">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              <span>Demo Mode: Use test card 4242 4242 4242 4242</span>
            </div>

            <div className="space-y-2">
              <Label>Card Number</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="pl-10"
                  placeholder="4242 4242 4242 4242"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expiry</Label>
                <Input
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                />
              </div>
              <div className="space-y-2">
                <Label>CVC</Label>
                <Input
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  placeholder="123"
                  maxLength={4}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleDemoPayment}
              disabled={processing}
              className="w-full"
              size="lg"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Pay ${amount || "0"}
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={handleCancel}
              disabled={processing}
              className="w-full"
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            🔒 This is a demo checkout. No real payment will be processed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
