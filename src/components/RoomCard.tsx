import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Wifi, Coffee, Tv } from "lucide-react";
import { Link } from "react-router-dom";

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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-64 overflow-hidden">
        <img
          src={room.images[0] || "/placeholder.svg"}
          alt={room.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground">
          {getTypeLabel(room.type)}
        </Badge>
      </div>

      <CardHeader>
        <div className="flex justify-between items-start">
          <h3 className="font-serif text-2xl font-semibold">{room.name}</h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-accent">${room.price_per_night}</div>
            <div className="text-sm text-muted-foreground">per night</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
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
        <Button className="w-full" asChild disabled={!room.is_available}>
          <Link to={`/booking?roomId=${room.id}`}>
            {room.is_available ? "Book Now" : "Unavailable"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RoomCard;