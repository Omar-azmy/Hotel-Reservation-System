import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface ReviewFormProps {
  bookingId: string;
  roomId: string;
  userId: string;
  onSuccess: () => void;
}

export const ReviewForm = ({ bookingId, roomId, userId, onSuccess }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files);
      if (photos.length + newPhotos.length > 5) {
        toast.error("You can only upload up to 5 photos");
        return;
      }
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!reviewText.trim()) {
      toast.error("Please write a review");
      return;
    }

    setUploading(true);

    try {
      // Upload photos to storage
      const photoUrls: string[] = [];
      
      for (const photo of photos) {
        const fileExt = photo.name.split(".").pop();
        const fileName = `${userId}/${bookingId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("review-photos")
          .upload(fileName, photo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("review-photos")
          .getPublicUrl(fileName);

        photoUrls.push(publicUrl);
      }

      // Create review
      const { error } = await supabase.from("reviews").insert({
        room_id: roomId,
        booking_id: bookingId,
        user_id: userId,
        rating,
        review_text: reviewText,
        photos: photoUrls,
      });

      if (error) throw error;

      toast.success("Review submitted successfully!");
      onSuccess();
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error(error.message || "Failed to submit review");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="review" className="text-sm font-medium mb-2 block">
          Your Review
        </label>
        <Textarea
          id="review"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your experience at this hotel..."
          rows={4}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Photos (Optional, max 5)</label>
        <div className="space-y-2">
          {photos.length > 0 && (
            <div className="grid grid-cols-5 gap-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-20 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {photos.length < 5 && (
            <div>
              <input
                type="file"
                id="photos"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                className="hidden"
              />
              <label
                htmlFor="photos"
                className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Upload className="h-4 w-4" />
                Upload photos
              </label>
            </div>
          )}
        </div>
      </div>

      <Button type="submit" disabled={uploading} className="w-full">
        {uploading ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
};
