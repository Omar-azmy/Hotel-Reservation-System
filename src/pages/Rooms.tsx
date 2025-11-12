import Navbar from "@/components/Navbar";
import RoomCard from "@/components/RoomCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const Rooms = () => {
  const [typeFilter, setTypeFilter] = useState<string | "all">("all");

  const { data: rooms, isLoading } = useQuery({
    queryKey: ["rooms", typeFilter],
    queryFn: async () => {
      let query = supabase.from("rooms").select("*").order("price_per_night");

      if (typeFilter !== "all") {
        query = query.eq("type", typeFilter as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

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

          <div className="mb-8 flex justify-end">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rooms</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="deluxe">Deluxe</SelectItem>
                <SelectItem value="executive_suite">Executive Suite</SelectItem>
              </SelectContent>
            </Select>
          </div>

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