import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Wifi, Coffee, Tv, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Room {
  id: string;
  name: string;
  type: string;
  description: string;
  price_per_night: number;
  capacity: number;
  amenities: string[];
  images: string[];
  is_available: boolean;
}

interface RoomCardProps {
  room: Room;
}

const RoomCard = ({ room }: RoomCardProps) => {
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    fetchRating();
  }, [room.id]);

  const fetchRating = async () => {
    const [avgData, countData] = await Promise.all([
      supabase.rpc("get_room_average_rating", { p_room_id: room.id }),
      supabase.rpc("get_room_review_count", { p_room_id: room.id }),
    ]);

    if (avgData.data !== null) setAverageRating(Number(avgData.data));
    if (countData.data !== null) setReviewCount(Number(countData.data));
  };
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "standard":
        return "Standard";
      case "deluxe":
        return "Deluxe";
      case "executive_suite":
        return "Executive Suite";
      default:
        return type;
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes("wifi") || lower.includes("wi-fi")) return <Wifi className="h-4 w-4" />;
    if (lower.includes("coffee")) return <Coffee className="h-4 w-4" />;
    if (lower.includes("tv")) return <Tv className="h-4 w-4" />;
    return null;
  };

  return (
    <Card className="overflow-hidden hover-lift group transition-all duration-500 border-border/50 backdrop-blur-sm bg-card/80">
      <div className="relative h-64 overflow-hidden">
        <img
          src={room.images[0] || "/placeholder.svg"}
          alt={room.name}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground shadow-lg backdrop-blur-sm animate-fade-in">
          {getTypeLabel(room.type)}
        </Badge>
      </div>

      <CardHeader className="transition-all duration-300 group-hover:bg-muted/30">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-serif text-2xl font-semibold transition-colors duration-300 group-hover:text-accent">{room.name}</h3>
            {reviewCount > 0 && (
              <div className="flex items-center gap-1 mt-1 animate-fade-in">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{averageRating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">
                  ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-accent gradient-text">${room.price_per_night}</div>
            <div className="text-sm text-muted-foreground">per night</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 transition-all duration-300">
        <p className="text-muted-foreground line-clamp-2">{room.description}</p>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>Up to {room.capacity} guests</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {room.amenities.slice(0, 4).map((amenity) => (
            <div
              key={amenity}
              className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-xs"
            >
              {getAmenityIcon(amenity)}
              <span>{amenity}</span>
            </div>
          ))}
          {room.amenities.length > 4 && (
            <div className="flex items-center px-2 py-1 bg-muted rounded-md text-xs">
              +{room.amenities.length - 4} more
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover-glow" 
          asChild 
          disabled={!room.is_available}
        >
          <Link to={`/booking?roomId=${room.id}`}>
            {room.is_available ? "Book Now" : "Unavailable"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RoomCard;