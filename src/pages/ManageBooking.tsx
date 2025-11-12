import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import { Search } from "lucide-react";

const ManageBooking = () => {
  const [searchParams] = useSearchParams();
  const initialRef = searchParams.get("ref");
  
  const [bookingRef, setBookingRef] = useState(initialRef || "");
  const [email, setEmail] = useState("");
  const [searchAttempted, setSearchAttempted] = useState(!!initialRef);

  const { data: booking, isLoading, refetch } = useQuery({
    queryKey: ["booking", bookingRef, email],
    queryFn: async () => {
      if (!bookingRef || !email) return null;

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          rooms (*)
        `)
        .eq("booking_reference", bookingRef)
        .eq("customer_email", email)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: searchAttempted && !!bookingRef && !!email,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingRef || !email) {
      toast.error("Please enter both booking reference and email");
      return;
    }
    setSearchAttempted(true);
    refetch();
  };

  const handleCancelBooking = async () => {
    if (!booking) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", booking.id);

      if (error) throw error;

      toast.success("Booking cancelled successfully");
      refetch();
    } catch (error: any) {
      console.error("Cancel error:", error);
      toast.error(error.message || "Failed to cancel booking");
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

                <Button type="submit" className="w-full">
                  <Search className="mr-2 h-4 w-4" />
                  Search Booking
                </Button>
              </form>
            </CardContent>
          </Card>

          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Searching for your booking...</p>
            </div>
          )}

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

          {booking && booking.rooms && (
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
                <div>
                  <img
                    src={booking.rooms.images[0]}
                    alt={booking.rooms.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="font-serif text-xl font-semibold mb-2">{booking.rooms.name}</h3>
                  <p className="text-muted-foreground">{booking.rooms.description}</p>
                </div>

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
                  >
                    Cancel Booking
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