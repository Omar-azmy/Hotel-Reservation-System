import Navbar from "@/components/Navbar";
import RoomCard from "@/components/RoomCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, SlidersHorizontal, X } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";

const Rooms = () => {
  const [typeFilter, setTypeFilter] = useState<string | "all">("all");
  const [priceRange, setPriceRange] = useState<number[]>([0, 500]);
  const [capacity, setCapacity] = useState<string>("any");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [showFilters, setShowFilters] = useState(false);

  const commonAmenities = [
    "Wi-Fi",
    "Air Conditioning",
    "TV",
    "Mini Bar",
    "Coffee Machine",
    "Work Desk",
    "Seating Area",
    "Premium Toiletries",
  ];

  const { data: rooms, isLoading } = useQuery({
    queryKey: ["rooms", typeFilter, priceRange, capacity, selectedAmenities, checkIn, checkOut],
    queryFn: async () => {
      let query = supabase.from("rooms").select("*").order("price_per_night");

      // Type filter
      if (typeFilter !== "all") {
        query = query.eq("type", typeFilter as any);
      }

      // Price range filter
      query = query.gte("price_per_night", priceRange[0]).lte("price_per_night", priceRange[1]);

      // Capacity filter
      if (capacity !== "any") {
        query = query.gte("capacity", parseInt(capacity));
      }

      const { data: allRooms, error } = await query;
      if (error) throw error;

      let filteredRooms = allRooms || [];

      // Amenities filter (client-side because it's an array)
      if (selectedAmenities.length > 0) {
        filteredRooms = filteredRooms.filter((room) =>
          selectedAmenities.every((amenity) => room.amenities?.includes(amenity))
        );
      }

      // Availability filter (check against bookings)
      if (checkIn && checkOut) {
        const { data: bookings, error: bookingError } = await supabase
          .from("bookings")
          .select("room_id")
          .in("status", ["confirmed", "pending"])
          .or(`check_in.lte.${format(checkOut, "yyyy-MM-dd")},check_out.gte.${format(checkIn, "yyyy-MM-dd")}`);

        if (bookingError) throw bookingError;

        const bookedRoomIds = bookings?.map((b) => b.room_id) || [];
        filteredRooms = filteredRooms.filter((room) => !bookedRoomIds.includes(room.id));
      }

      return filteredRooms;
    },
  });

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setTypeFilter("all");
    setPriceRange([0, 500]);
    setCapacity("any");
    setSelectedAmenities([]);
    setCheckIn(undefined);
    setCheckOut(undefined);
  };

  const hasActiveFilters =
    typeFilter !== "all" ||
    priceRange[0] !== 0 ||
    priceRange[1] !== 500 ||
    capacity !== "any" ||
    selectedAmenities.length > 0 ||
    checkIn ||
    checkOut;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-serif text-5xl font-bold mb-4">Our Rooms</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose from our range of thoughtfully designed accommodations
            </p>
          </div>

          <div className="mb-8 flex gap-4 justify-between items-center flex-wrap">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>

            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="gap-2">
                <X className="h-4 w-4" />
                Clear All Filters
              </Button>
            )}
          </div>

          {showFilters && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Filter Rooms</CardTitle>
                <CardDescription>
                  Narrow down your search to find the perfect room
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Room Type */}
                  <div className="space-y-2">
                    <Label>Room Type</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="deluxe">Deluxe</SelectItem>
                        <SelectItem value="executive_suite">Executive Suite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Capacity */}
                  <div className="space-y-2">
                    <Label>Minimum Capacity</Label>
                    <Select value={capacity} onValueChange={setCapacity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any capacity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="1">1+ Guest</SelectItem>
                        <SelectItem value="2">2+ Guests</SelectItem>
                        <SelectItem value="3">3+ Guests</SelectItem>
                        <SelectItem value="4">4+ Guests</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-4">
                    <Label>
                      Price Range: ${priceRange[0]} - ${priceRange[1]}
                    </Label>
                    <Slider
                      min={0}
                      max={500}
                      step={10}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <Label>Check Availability</Label>
                  <div className="flex flex-wrap gap-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !checkIn && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkIn ? format(checkIn, "PPP") : "Check-in date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={checkIn}
                          onSelect={setCheckIn}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !checkOut && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkOut ? format(checkOut, "PPP") : "Check-out date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={checkOut}
                          onSelect={setCheckOut}
                          disabled={(date) => date <= (checkIn || new Date())}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Amenities */}
                <div className="space-y-3">
                  <Label>Amenities</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {commonAmenities.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity}
                          checked={selectedAmenities.includes(amenity)}
                          onCheckedChange={() => toggleAmenity(amenity)}
                        />
                        <label
                          htmlFor={amenity}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {amenity}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              <>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </>
            ) : rooms && rooms.length > 0 ? (
              rooms.map((room) => <RoomCard key={room.id} room={room} />)
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground text-lg">No rooms found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Rooms;