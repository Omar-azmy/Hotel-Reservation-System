import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { ReviewsList } from "@/components/ReviewsList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

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

const RoomDetail = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (roomId) {
      fetchRoom();
    }
  }, [roomId]);

  const fetchRoom = async () => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      if (error) throw error;
      setRoom(data);
    } catch (error: any) {
      console.error("Error fetching room:", error);
      toast.error("Failed to load room details");
      navigate("/rooms");
    } finally {
      setLoading(false);
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

  if (!room) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Room not found</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate("/rooms")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Rooms
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative h-96 rounded-lg overflow-hidden">
              <img
                src={room.images[currentImageIndex] || "/placeholder.svg"}
                alt={room.name}
                className="w-full h-full object-cover"
              />
            </div>
            {room.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {room.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative h-20 rounded overflow-hidden ${
                      currentImageIndex === index ? "ring-2 ring-accent" : ""
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${room.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Room Details */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-2">{getTypeLabel(room.type)}</Badge>
              <h1 className="font-serif text-4xl font-bold mb-4">{room.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Users className="h-4 w-4" />
                <span>Up to {room.capacity} guests</span>
              </div>
              <div className="text-3xl font-bold text-accent mb-6">
                ${room.price_per_night}
                <span className="text-base font-normal text-muted-foreground"> / night</span>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{room.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Amenities</h3>
                <div className="grid grid-cols-2 gap-2">
                  {room.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full"
              size="lg"
              onClick={() => navigate(`/booking?roomId=${room.id}`)}
              disabled={!room.is_available}
            >
              {room.is_available ? "Book Now" : "Unavailable"}
            </Button>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="font-serif text-3xl font-bold mb-6">Guest Reviews</h2>
          <ReviewsList roomId={room.id} />
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;
