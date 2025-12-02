import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { format } from "date-fns";

interface BookingReceiptProps {
  booking: {
    id: string;
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
    rooms?: {
      name: string;
      type: string;
      price_per_night: number;
    };
  };
}

export const BookingReceipt = ({ booking }: BookingReceiptProps) => {
  const handlePrint = () => {
    window.print();
  };

  const calculateNights = () => {
    const checkIn = new Date(booking.check_in);
    const checkOut = new Date(booking.check_out);
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();

  return (
    <div>
      {/* Print button - hidden when printing */}
      <div className="print:hidden mb-4 flex gap-2">
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" />
          Print Receipt
        </Button>
        <Button onClick={handlePrint} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Save as PDF
        </Button>
      </div>

      {/* Receipt content - optimized for printing */}
      <Card className="print:shadow-none print:border-0">
        <CardContent className="p-8 print:p-12">
          {/* Header */}
          <div className="text-center border-b-2 border-primary pb-6 mb-6">
            <h1 className="font-serif text-3xl font-bold text-primary mb-2">
              City Business Hotel
            </h1>
            <p className="text-muted-foreground">Your Comfort, Our Priority</p>
            <p className="text-sm text-muted-foreground mt-2">
              123 Business District, Cairo, Egypt | +20 2 1234 5678
            </p>
          </div>

          {/* Receipt Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Booking Receipt</h2>
            <p className="text-lg font-mono font-semibold text-primary">
              {booking.booking_reference}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Issued: {format(new Date(booking.created_at), "MMMM dd, yyyy 'at' h:mm a")}
            </p>
          </div>

          {/* Guest Information */}
          <div className="mb-6 bg-muted/30 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 text-lg">Guest Information</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <span className="ml-2 font-medium">{booking.customer_name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <span className="ml-2 font-medium">{booking.customer_email}</span>
              </div>
              {booking.customer_phone && (
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="ml-2 font-medium">{booking.customer_phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Booking Details */}
          <div className="mb-6 bg-muted/30 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 text-lg">Booking Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Room:</span>
                <span className="font-medium">{booking.rooms?.name || "Room"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Room Type:</span>
                <span className="font-medium capitalize">
                  {booking.rooms?.type?.replace("_", " ") || "Standard"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check-in:</span>
                <span className="font-medium">
                  {format(new Date(booking.check_in), "EEEE, MMMM dd, yyyy")} (2:00 PM)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check-out:</span>
                <span className="font-medium">
                  {format(new Date(booking.check_out), "EEEE, MMMM dd, yyyy")} (11:00 AM)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Number of Nights:</span>
                <span className="font-medium">{nights}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Number of Guests:</span>
                <span className="font-medium">{booking.guests}</span>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="mb-6 bg-muted/30 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 text-lg">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Room Rate (${booking.rooms?.price_per_night || 0}/night)
                </span>
                <span className="font-medium">
                  ${((booking.rooms?.price_per_night || 0) * nights).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Number of Nights:</span>
                <span className="font-medium">× {nights}</span>
              </div>
              <div className="border-t border-border pt-2 mt-2 flex justify-between items-center">
                <span className="font-semibold text-base">Total Amount:</span>
                <span className="font-bold text-xl text-primary">
                  ${Number(booking.total_price).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-muted-foreground">Payment Status:</span>
                <span className="font-medium capitalize text-green-600">
                  {booking.payment_status}
                </span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mb-6 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-green-900 dark:text-green-100">
                Booking Status:
              </span>
              <span className="font-bold text-lg text-green-600 dark:text-green-400 capitalize">
                {booking.status}
              </span>
            </div>
          </div>

          {/* Important Information */}
          <div className="text-xs text-muted-foreground space-y-2 border-t pt-4">
            <p className="font-semibold">Important Information:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check-in time: 2:00 PM | Check-out time: 11:00 AM</li>
              <li>Valid government-issued photo ID required at check-in</li>
              <li>Early check-in and late check-out subject to availability</li>
              <li>Cancellation policy applies as per booking terms</li>
            </ul>
            <p className="mt-4">
              For inquiries or modifications, please contact us at reservations@citybusinesshotel.com
              or call +20 2 1234 5678, referencing your booking number.
            </p>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground mt-8 pt-4 border-t">
            <p>Thank you for choosing City Business Hotel</p>
            <p className="mt-1">We look forward to welcoming you!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
