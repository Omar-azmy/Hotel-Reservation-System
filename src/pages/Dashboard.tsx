import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { User, Calendar, CreditCard, Star, FileText } from "lucide-react";
import { ReviewForm } from "@/components/ReviewForm";
import { BookingReceipt } from "@/components/BookingReceipt";

interface Booking {
  id: string;
  room_id: string;
  booking_reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: string;
  payment_status: string;
  created_at: string;
  rooms: {
    name: string;
    type: string;
    price_per_night: number;
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [existingReviews, setExistingReviews] = useState<Record<string, boolean>>({});

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
    await fetchProfile(session.user.id);
    await fetchBookings(session.user.id);
    setLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
    } else if (data) {
      setProfile({
        full_name: data.full_name || "",
        phone: data.phone || "",
      });
    }
  };

  const fetchBookings = async (userId: string) => {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        rooms (name, type, price_per_night)
      `)
      .eq("customer_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } else {
      setBookings(data || []);
      
      // Check which bookings have reviews
      if (data) {
        const reviewChecks = await Promise.all(
          data.map(async (booking) => {
            const { data: review } = await supabase
              .from("reviews")
              .select("id")
              .eq("booking_id", booking.id)
              .maybeSingle();
            return { bookingId: booking.id, hasReview: !!review };
          })
        );
        
        const reviewMap: Record<string, boolean> = {};
        reviewChecks.forEach(({ bookingId, hasReview }) => {
          reviewMap[bookingId] = hasReview;
        });
        setExistingReviews(reviewMap);
      }
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const cancelBooking = async (bookingId: string, booking: Booking) => {
    const confirmed = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;

      // Send cancellation email
      try {
        await supabase.functions.invoke("send-booking-email", {
          body: {
            to: user.email,
            customerName: profile.full_name || user.email,
            bookingReference: booking.booking_reference,
            roomName: booking.rooms.name,
            checkIn: booking.check_in,
            checkOut: booking.check_out,
            guests: booking.guests,
            totalPrice: Number(booking.total_price),
            type: "cancellation",
          },
        });
      } catch (emailError) {
        console.error("Email error:", emailError);
      }

      toast.success("Booking cancelled successfully");
      await fetchBookings(user.id);
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

  const filterBookings = (status: "all" | "active" | "past" | "cancelled") => {
    const now = new Date();
    
    switch (status) {
      case "active":
        return bookings.filter((b) => 
          (b.status === "confirmed" || b.status === "pending") && 
          new Date(b.check_out) >= now
        );
      case "past":
        return bookings.filter((b) => 
          b.status === "completed" || 
          (b.status === "confirmed" && new Date(b.check_out) < now)
        );
      case "cancelled":
        return bookings.filter((b) => b.status === "cancelled");
      default:
        return bookings;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">Manage your profile and reservations</p>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="bookings" className="gap-2">
              <Calendar className="h-4 w-4" />
              My Bookings
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking History</CardTitle>
                <CardDescription>
                  View and manage all your reservations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="all">
                      All ({bookings.length})
                    </TabsTrigger>
                    <TabsTrigger value="active">
                      Active ({filterBookings("active").length})
                    </TabsTrigger>
                    <TabsTrigger value="past">
                      Past ({filterBookings("past").length})
                    </TabsTrigger>
                    <TabsTrigger value="cancelled">
                      Cancelled ({filterBookings("cancelled").length})
                    </TabsTrigger>
                  </TabsList>

                  {["all", "active", "past", "cancelled"].map((status) => (
                    <TabsContent key={status} value={status}>
                      {filterBookings(status as any).length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">No {status} bookings found.</p>
                          {status === "active" && (
                            <Button
                              onClick={() => navigate("/rooms")}
                              className="mt-4"
                            >
                              Book a Room
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Reference</TableHead>
                                <TableHead>Room</TableHead>
                                <TableHead>Check In</TableHead>
                                <TableHead>Check Out</TableHead>
                                <TableHead>Guests</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filterBookings(status as any).map((booking) => (
                                <TableRow key={booking.id}>
                                  <TableCell className="font-mono text-sm">
                                    {booking.booking_reference}
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">{booking.rooms.name}</div>
                                      <div className="text-sm text-muted-foreground capitalize">
                                        {booking.rooms.type.replace("_", " ")}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {format(new Date(booking.check_in), "MMM dd, yyyy")}
                                  </TableCell>
                                  <TableCell>
                                    {format(new Date(booking.check_out), "MMM dd, yyyy")}
                                  </TableCell>
                                  <TableCell>{booking.guests}</TableCell>
                                  <TableCell className="font-semibold">
                                    ${Number(booking.total_price).toFixed(2)}
                                  </TableCell>
                                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                                   <TableCell>
                                     <div className="flex gap-2 flex-wrap">
                                       {(booking.status === "confirmed" || booking.status === "pending") &&
                                         new Date(booking.check_in) > new Date() && (
                                           <Button
                                             size="sm"
                                             variant="destructive"
                                             onClick={() => cancelBooking(booking.id, booking)}
                                           >
                                             Cancel
                                           </Button>
                                         )}
                                       {(booking.status === "completed" || 
                                         (booking.status === "confirmed" && new Date(booking.check_out) < new Date())) &&
                                         !existingReviews[booking.id] && (
                                           <Button
                                             size="sm"
                                             variant="outline"
                                             onClick={() => {
                                               setSelectedBooking(booking);
                                               setReviewDialogOpen(true);
                                             }}
                                           >
                                             <Star className="h-4 w-4 mr-1" />
                                             Write Review
                                           </Button>
                                         )}
                                       {existingReviews[booking.id] && (
                                         <Badge variant="secondary">
                                           <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                                           Reviewed
                                         </Badge>
                                       )}
                                       {(booking.status === "confirmed" || booking.status === "completed") && (
                                         <Button
                                           size="sm"
                                           variant="outline"
                                           onClick={() => {
                                             setSelectedBooking(booking);
                                             setReceiptDialogOpen(true);
                                           }}
                                         >
                                           <FileText className="h-4 w-4 mr-1" />
                                           Receipt
                                         </Button>
                                       )}
                                     </div>
                                   </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={updateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={profile.full_name}
                        onChange={(e) =>
                          setProfile({ ...profile, full_name: e.target.value })
                        }
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profile.phone}
                        onChange={(e) =>
                          setProfile({ ...profile, phone: e.target.value })
                        }
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <Button type="submit" disabled={updating} className="w-full">
                      {updating ? "Updating..." : "Update Profile"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Summary</CardTitle>
                  <CardDescription>
                    Your booking statistics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Bookings</p>
                      <p className="text-2xl font-bold">{bookings.length}</p>
                    </div>
                    <CreditCard className="h-8 w-8 text-accent" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Reservations</p>
                      <p className="text-2xl font-bold">{filterBookings("active").length}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-accent" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Completed Stays</p>
                      <p className="text-2xl font-bold">{filterBookings("past").length}</p>
                    </div>
                    <User className="h-8 w-8 text-accent" />
                  </div>

                  <div className="pt-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate("/rooms")}
                    >
                      Book Another Stay
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-semibold">{selectedBooking.rooms.name}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(selectedBooking.check_in), "MMM dd")} -{" "}
                  {format(new Date(selectedBooking.check_out), "MMM dd, yyyy")}
                </p>
              </div>
              <ReviewForm
                bookingId={selectedBooking.id}
                roomId={selectedBooking.room_id}
                userId={user.id}
                onSuccess={() => {
                  setReviewDialogOpen(false);
                  setSelectedBooking(null);
                  fetchBookings(user.id);
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Receipt</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <BookingReceipt booking={selectedBooking} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
