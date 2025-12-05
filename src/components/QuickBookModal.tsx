import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CalendarIcon, CreditCard, Loader2 } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Room {
  id: string;
  name: string;
  type: string;
  price_per_night: number;
  capacity: number;
  images: string[];
}

interface QuickBookModalProps {
  room: Room;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuickBookModal = ({ room, open, onOpenChange }: QuickBookModalProps) => {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<{ full_name: string; phone: string } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("id", session.user.id)
          .maybeSingle();
        setProfile(data);
      }
    };
    
    if (open) {
      checkAuth();
    }
  }, [open]);

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const totalPrice = nights > 0 ? nights * room.price_per_night : 0;

  const handleQuickBook = async () => {
    if (!user) {
      toast.error("Please sign in to book");
      onOpenChange(false);
      navigate("/auth");
      return;
    }

    if (!checkIn || !checkOut) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    if (nights <= 0) {
      toast.error("Check-out must be after check-in");
      return;
    }

    if (guests > room.capacity) {
      toast.error(`Maximum ${room.capacity} guests allowed`);
      return;
    }

    setLoading(true);

    try {
      // Check availability
      const { data: available, error: availError } = await supabase.rpc("check_room_availability", {
        p_room_id: room.id,
        p_check_in: format(checkIn, "yyyy-MM-dd"),
        p_check_out: format(checkOut, "yyyy-MM-dd"),
      });

      if (availError) throw availError;
      if (!available) {
        toast.error("Room not available for selected dates");
        setLoading(false);
        return;
      }

      // Generate booking reference
      const { data: bookingRef, error: refError } = await supabase.rpc("generate_booking_reference");
      if (refError) throw refError;

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          booking_reference: bookingRef,
          room_id: room.id,
          customer_id: user.id,
          customer_name: profile?.full_name || user.email?.split("@")[0] || "Guest",
          customer_email: user.email,
          customer_phone: profile?.phone || null,
          check_in: format(checkIn, "yyyy-MM-dd"),
          check_out: format(checkOut, "yyyy-MM-dd"),
          guests,
          total_price: totalPrice,
          status: "pending",
          payment_status: "pending",
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Redirect to demo checkout page
      const checkoutParams = new URLSearchParams({
        booking_id: booking.id,
        amount: totalPrice.toString(),
        room_name: room.name,
        check_in: format(checkIn, "MMM dd, yyyy"),
        check_out: format(checkOut, "MMM dd, yyyy"),
      });
      
      onOpenChange(false);
      navigate(`/demo-checkout?${checkoutParams.toString()}`);
    } catch (error: any) {
      console.error("Quick book error:", error);
      toast.error(error.message || "Failed to process booking");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Quick Book</DialogTitle>
          <DialogDescription>{room.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Room Preview */}
          <div className="flex gap-4 p-3 bg-muted/50 rounded-lg">
            <img
              src={room.images[0] || "/placeholder.svg"}
              alt={room.name}
              className="w-20 h-20 object-cover rounded-md"
            />
            <div className="flex-1">
              <h4 className="font-semibold">{room.name}</h4>
              <p className="text-accent font-bold">${room.price_per_night}/night</p>
              <p className="text-sm text-muted-foreground">Up to {room.capacity} guests</p>
            </div>
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Check-in</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkIn && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkIn ? format(checkIn, "MMM dd") : "Select"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={checkIn}
                    onSelect={setCheckIn}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Check-out</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkOut && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOut ? format(checkOut, "MMM dd") : "Select"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={checkOut}
                    onSelect={setCheckOut}
                    disabled={(date) => date <= (checkIn || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Guests */}
          <div className="space-y-2">
            <Label>Guests</Label>
            <Input
              type="number"
              min={1}
              max={room.capacity}
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
            />
          </div>

          {/* Summary */}
          {nights > 0 && (
            <div className="p-4 bg-accent/10 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>${room.price_per_night} × {nights} nights</span>
                <span>${totalPrice}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total</span>
                <span className="text-accent">${totalPrice}</span>
              </div>
            </div>
          )}

          {/* Action Button */}
          {!user ? (
            <Button 
              className="w-full" 
              onClick={() => {
                onOpenChange(false);
                navigate("/auth");
              }}
            >
              Sign In to Book
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={handleQuickBook}
              disabled={loading || nights <= 0}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay ${totalPrice} Now
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
