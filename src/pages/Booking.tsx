import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { PhoneInput } from "@/components/PhoneInput";
import { isValidPhoneNumber } from "libphonenumber-js";

const Booking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");

  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // Validation schema - supports Arabic and Latin characters
  const bookingSchema = z.object({
    // Support Arabic (ا-ي) and Latin (A-Z, a-z) characters, spaces, hyphens, apostrophes
    customerName: z
      .string()
      .trim()
      .min(2, "الاسم يجب أن يكون حرفين على الأقل / Name must be at least 2 characters")
      .max(100, "الاسم يجب أن يكون أقل من 100 حرف / Name must be less than 100 characters")
      .regex(
        /^[\u0600-\u06FFa-zA-Z\s\-']+$/,
        "الاسم يجب أن يحتوي على أحرف عربية أو إنجليزية فقط / Name must contain only Arabic or Latin characters"
      ),
    customerEmail: z
      .string()
      .email("بريد إلكتروني غير صحيح / Invalid email address")
      .max(255, "البريد الإلكتروني يجب أن يكون أقل من 255 حرف / Email must be less than 255 characters"),
    customerPhone: z
      .string()
      .refine(
        (value) => !value || isValidPhoneNumber(value),
        "رقم هاتف غير صحيح / Invalid phone number"
      )
      .optional()
      .or(z.literal("")),
    guests: z
      .number()
      .int()
      .min(1, "يجب أن يكون هناك ضيف واحد على الأقل / At least 1 guest required")
      .max(10, "الحد الأقصى 10 ضيوف / Maximum 10 guests allowed"),
  });

  const { data: room, isLoading: roomLoading } = useQuery({
    queryKey: ["room", roomId],
    queryFn: async () => {
      if (!roomId) throw new Error("Room ID is required");
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!roomId,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCustomerEmail(session.user.email || "");
        
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profile) {
          setCustomerName(profile.full_name || "");
          // Only set phone if it's in valid E.164 format
          const phone = profile.phone || "";
          if (phone && phone.startsWith("+")) {
            setCustomerPhone(phone);
          } else {
            setCustomerPhone("");
          }
        }
      }
    };

    checkAuth();
  }, []);

  if (!roomId) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-3xl font-bold mb-4">No Room Selected</h1>
          <Button onClick={() => navigate("/rooms")}>Browse Rooms</Button>
        </div>
      </div>
    );
  }

  if (roomLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-3xl font-bold mb-4">Room Not Found</h1>
          <Button onClick={() => navigate("/rooms")}>Browse Rooms</Button>
        </div>
      </div>
    );
  }

  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0;
    const nights = differenceInDays(checkOut, checkIn);
    return nights > 0 ? nights * room.price_per_night : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted");
    
    if (!checkIn || !checkOut) {
      console.log("Missing dates");
      toast.error("Please select check-in and check-out dates");
      return;
    }

    if (checkOut <= checkIn) {
      console.log("Invalid date range");
      toast.error("Check-out date must be after check-in date");
      return;
    }

    if (guests > room.capacity) {
      console.log("Too many guests");
      toast.error(`This room can accommodate maximum ${room.capacity} guests`);
      return;
    }

    // Validate input data
    console.log("Validating form data:", {
      customerName,
      customerEmail,
      customerPhone,
      guests,
    });

    const validationResult = bookingSchema.safeParse({
      customerName,
      customerEmail,
      customerPhone,
      guests: parseInt(guests as any),
    });

    if (!validationResult.success) {
      console.log("Validation failed:", validationResult.error.errors);
      const firstError = validationResult.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    console.log("All validation passed, setting loading state");
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to make a booking");
        navigate("/auth");
        return;
      }

      // Check room availability
      const { data: availabilityData, error: availabilityError } = await supabase
        .rpc("check_room_availability", {
          p_room_id: roomId,
          p_check_in: format(checkIn, "yyyy-MM-dd"),
          p_check_out: format(checkOut, "yyyy-MM-dd"),
        });

      if (availabilityError) throw availabilityError;

      if (!availabilityData) {
        toast.error("This room is not available for the selected dates");
        setLoading(false);
        return;
      }

      // Generate booking reference
      const { data: bookingRef, error: refError } = await supabase
        .rpc("generate_booking_reference");

      if (refError) throw refError;

      // Create booking with pending payment status
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          booking_reference: bookingRef,
          room_id: roomId,
          customer_id: session.user.id,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          check_in: format(checkIn, "yyyy-MM-dd"),
          check_out: format(checkOut, "yyyy-MM-dd"),
          guests,
          total_price: calculateTotal(),
          status: "pending",
          payment_status: "pending",
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create Stripe payment session
      console.log("Creating payment session...");
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        "create-payment",
        {
          body: {
            bookingId: booking.id,
            roomId: roomId,
            amount: calculateTotal(),
            customerEmail: customerEmail,
            customerName: customerName,
            bookingReference: bookingRef,
            roomName: room.name,
            checkIn: format(checkIn, "yyyy-MM-dd"),
            checkOut: format(checkOut, "yyyy-MM-dd"),
          },
        }
      );

      console.log("Payment response:", { paymentData, paymentError });

      if (paymentError) {
        console.error("Payment error:", paymentError);
        throw new Error(paymentError.message || "Failed to create payment session");
      }
      
      if (!paymentData?.url) {
        console.error("No payment URL in response:", paymentData);
        throw new Error("No payment URL received from server");
      }

      // Redirect to Stripe Checkout immediately
      console.log("Redirecting to payment URL:", paymentData.url);
      window.location.replace(paymentData.url);
    } catch (error: any) {
      console.error("Booking error:", error);
      
      // Provide user-friendly error messages
      let errorMessage = "Failed to create booking. Please try again.";
      
      if (error.message?.includes("payment")) {
        errorMessage = "Payment processing failed. Please check your payment details and try again.";
      } else if (error.message?.includes("availability")) {
        errorMessage = "This room is no longer available for the selected dates.";
      } else if (error.message?.includes("authentication")) {
        errorMessage = "Please sign in to complete your booking.";
      }
      
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <h1 className="font-serif text-4xl font-bold mb-8">Complete Your Booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card className="backdrop-blur-sm bg-card/50 border-border/50 shadow-xl transition-all duration-300 hover:shadow-2xl animate-fade-in">
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
                <CardDescription>
                  Fill in your information to complete the reservation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="checkIn">Check-in Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal transition-all duration-300 hover:border-accent",
                              !checkIn && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {checkIn ? format(checkIn, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 animate-fade-in">
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
                      <Label htmlFor="checkOut">Check-out Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal transition-all duration-300 hover:border-accent",
                              !checkOut && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {checkOut ? format(checkOut, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 animate-fade-in">
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

                  <div className="space-y-2">
                    <Label htmlFor="guests">Number of Guests *</Label>
                    <Input
                      id="guests"
                      type="number"
                      min="1"
                      max={room.capacity}
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                      required
                      className="transition-all duration-300 focus:scale-[1.02]"
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum capacity: {room.capacity} {room.capacity === 1 ? "guest" : "guests"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ahmed Ali"
                      required
                      dir="auto"
                      className="transition-all duration-300 focus:scale-[1.02]"
                    />
                    <p className="text-xs text-muted-foreground">
                      You can use Arabic or English characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="ahmed@example.com"
                      required
                      className="transition-all duration-300 focus:scale-[1.02]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <PhoneInput
                      value={customerPhone}
                      onChange={(value) => setCustomerPhone(value || "")}
                      placeholder="+20 123 456 7890"
                      className="transition-all duration-300 focus-within:scale-[1.02]"
                    />
                    <p className="text-xs text-muted-foreground">
                      Select country code and enter phone number
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full transition-all duration-300 hover:scale-[1.02] hover:shadow-lg" 
                    size="lg" 
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Confirm Booking"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <img
                    src={room.images[0]}
                    alt={room.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="font-serif text-xl font-semibold">{room.name}</h3>
                </div>

                <div className="space-y-2 text-sm">
                  {checkIn && checkOut && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Check-in:</span>
                        <span className="font-medium">{format(checkIn, "MMM dd, yyyy")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Check-out:</span>
                        <span className="font-medium">{format(checkOut, "MMM dd, yyyy")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nights:</span>
                        <span className="font-medium">{nights}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guests:</span>
                    <span className="font-medium">{guests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price per night:</span>
                    <span className="font-medium">${room.price_per_night}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-accent">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;