import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { format } from "date-fns";

interface Review {
  id: string;
  rating: number;
  review_text: string;
  photos: string[];
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string;
  };
}

interface ReviewsListProps {
  roomId: string;
}

export const ReviewsList = ({ roomId }: ReviewsListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [roomId]);

  const fetchReviews = async () => {
    setLoading(true);
    
    const [reviewsData, avgData] = await Promise.all([
      supabase
        .from("reviews")
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .eq("room_id", roomId)
        .order("created_at", { ascending: false }),
      supabase.rpc("get_room_average_rating", { p_room_id: roomId }),
    ]);

    if (reviewsData.data) {
      setReviews(reviewsData.data as any);
    }

    if (avgData.data !== null) {
      setAverageRating(Number(avgData.data));
    }

    setLoading(false);
  };

  const renderStars = (rating: number, size: "sm" | "lg" = "sm") => {
    const starSize = size === "sm" ? "h-4 w-4" : "h-6 w-6";
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">out of 5</div>
            </div>
            <div>
              {renderStars(Math.round(averageRating), "lg")}
              <p className="text-sm text-muted-foreground mt-1">
                Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>
        </Card>
      )}

      {reviews.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarFallback>
                    {review.profiles.full_name
                      ? review.profiles.full_name.charAt(0).toUpperCase()
                      : review.profiles.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {review.profiles.full_name || "Anonymous"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(review.created_at), "MMMM dd, yyyy")}
                      </p>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-sm">{review.review_text}</p>
                  {review.photos.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {review.photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Review photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => window.open(photo, "_blank")}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
