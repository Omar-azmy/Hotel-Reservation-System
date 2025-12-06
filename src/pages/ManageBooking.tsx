import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import { Search, Loader2 } from "lucide-react";

interface BookingResult {
  id: string;
  booking_reference: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string | null;
  room_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: string;
  payment_status: string | null;
  created_at: string;
}

interface RoomData {
  id: string;
  name: string;
  description: string;
  images: string[];
}

const ManageBooking = () => {
  const [searchParams] = useSearchParams();
  const initialRef = searchParams.get("ref");
  
  const [bookingRef, setBookingRef] = useState(initialRef || "");
  const [email, setEmail] = useState("");
  const [booking, setBooking] = useState<BookingResult | null>(null);
  const [room, setRoom] = useState<RoomData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingRef || !email) {
      toast.error("Please enter both booking reference and email");
      return;
    }

    setIsLoading(true);
    setSearchAttempted(true);

    try {
      // Use the security definer function to lookup booking
      const { data, error } = await supabase
        .rpc('lookup_booking_by_reference', {
          p_booking_reference: bookingRef.toUpperCase(),
          p_customer_email: email
        });

      if (error) throw error;

      if (data && data.length > 0) {
        const bookingData = data[0] as BookingResult;
        setBooking(bookingData);

        // Fetch room details (rooms table is public)
        const { data: roomData, error: roomError } = await supabase
          .from('rooms')
          .select('id, name, description, images')
          .eq('id', bookingData.room_id)
          .single();

        if (!roomError && roomData) {
          setRoom(roomData);
        }
      } else {
        setBooking(null);
        setRoom(null);
      }
    } catch (error: any) {
      console.error("Search error:", error);
      toast.error("Failed to search for booking");
      setBooking(null);
      setRoom(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking? This action cannot be undone."
    );

    if (!confirmed) return;

    setIsCancelling(true);

    try {
      // Use the security definer function to cancel booking
      const { data, error } = await supabase
        .rpc('cancel_booking_by_reference', {
          p_booking_reference: booking.booking_reference,
          p_customer_email: booking.customer_email
        });

      if (error) throw error;

      if (!data) {
        throw new Error("Booking not found or already cancelled");
      }

      // Send cancellation email
      try {
        await supabase.functions.invoke("send-booking-email", {
          body: {
            to: booking.customer_email,
            customerName: booking.customer_name,
            bookingReference: booking.booking_reference,
            roomName: room?.name || "Room",
            checkIn: booking.check_in,
            checkOut: booking.check_out,
            guests: booking.guests,
            totalPrice: Number(booking.total_price),
            type: "cancellation",
          },
        });
      } catch (emailError) {
        console.error("Email error:", emailError);
        // Don't fail the cancellation if email fails
      }

      toast.success("Booking cancelled successfully!");
      
      // Update local state
      setBooking({ ...booking, status: "cancelled" });
    } catch (error: any) {
      console.error("Cancel error:", error);
      toast.error(error.message || "Failed to cancel booking");
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      confirmed: "default",
      pending: "secondary",
      cancelled: "destructive",
      completed: "outline",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-serif text-4xl font-bold mb-8 text-center">Manage Your Booking</h1>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Find Your Reservation</CardTitle>
              <CardDescription>
                Enter your booking reference and email to view or manage your reservation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bookingRef">Booking Reference</Label>
                  <Input
                    id="bookingRef"
                    value={bookingRef}
                    onChange={(e) => setBookingRef(e.target.value.toUpperCase())}
                    placeholder="BK20240101XXXX"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search Booking
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {searchAttempted && !isLoading && !booking && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-lg text-muted-foreground">
                  No booking found with the provided details. Please check your booking reference and
                  email address.
                </p>
              </CardContent>
            </Card>
          )}

          {booking && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Booking Details</CardTitle>
                    <CardDescription>Reference: {booking.booking_reference}</CardDescription>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {room && (
                  <div>
                    <img
                      src={room.images[0]}
                      alt={room.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <h3 className="font-serif text-xl font-semibold mb-2">{room.name}</h3>
                    <p className="text-muted-foreground">{room.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Check-in</p>
                    <p className="font-medium">{format(new Date(booking.check_in), "MMM dd, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Check-out</p>
                    <p className="font-medium">{format(new Date(booking.check_out), "MMM dd, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Guests</p>
                    <p className="font-medium">{booking.guests}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Total Price</p>
                    <p className="font-medium text-accent text-lg">${booking.total_price}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Guest Information</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Name:</span> {booking.customer_name}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Email:</span> {booking.customer_email}
                    </p>
                    {booking.customer_phone && (
                      <p>
                        <span className="text-muted-foreground">Phone:</span> {booking.customer_phone}
                      </p>
                    )}
                  </div>
                </div>

                {booking.status === "confirmed" && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleCancelBooking}
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      "Cancel Booking"
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageBooking;