import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { toast } from "sonner";

interface Room {
  id: string;
  name: string;
  type: string;
}

interface Booking {
  id: string;
  room_id: string;
  check_in: string;
  check_out: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  guests: number;
  total_price: number;
  status: string;
  booking_reference: string;
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [draggedBooking, setDraggedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    setLoading(true);
    const [roomsData, bookingsData] = await Promise.all([
      supabase.from("rooms").select("*").order("name"),
      supabase
        .from("bookings")
        .select("*")
        .gte("check_out", format(monthStart, "yyyy-MM-dd"))
        .lte("check_in", format(monthEnd, "yyyy-MM-dd")),
    ]);

    if (roomsData.data) setRooms(roomsData.data);
    if (bookingsData.data) setBookings(bookingsData.data);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/20 border-green-500 text-green-700 dark:text-green-300";
      case "pending":
        return "bg-yellow-500/20 border-yellow-500 text-yellow-700 dark:text-yellow-300";
      case "cancelled":
        return "bg-red-500/20 border-red-500 text-red-700 dark:text-red-300";
      case "completed":
        return "bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300";
      default:
        return "bg-muted border-border text-foreground";
    }
  };

  const getBookingsForRoomAndDate = (roomId: string, date: Date) => {
    return bookings.filter((booking) => {
      const checkIn = new Date(booking.check_in);
      const checkOut = new Date(booking.check_out);
      return booking.room_id === roomId && date >= checkIn && date < checkOut;
    });
  };

  const isBookingStart = (booking: Booking, date: Date) => {
    return isSameDay(new Date(booking.check_in), date);
  };

  const getBookingSpan = (booking: Booking, date: Date) => {
    const checkIn = new Date(booking.check_in);
    const checkOut = new Date(booking.check_out);
    const startDate = checkIn < monthStart ? monthStart : checkIn;
    const endDate = checkOut > monthEnd ? addDays(monthEnd, 1) : checkOut;
    
    if (isSameDay(startDate, date)) {
      return eachDayOfInterval({ start: startDate, end: addDays(endDate, -1) }).length;
    }
    return 0;
  };

  const handleDragStart = (booking: Booking) => {
    setDraggedBooking(booking);
  };

  const handleDrop = async (roomId: string, date: Date) => {
    if (!draggedBooking) return;

    const oldCheckIn = new Date(draggedBooking.check_in);
    const oldCheckOut = new Date(draggedBooking.check_out);
    const duration = Math.ceil((oldCheckOut.getTime() - oldCheckIn.getTime()) / (1000 * 60 * 60 * 24));

    const newCheckIn = format(date, "yyyy-MM-dd");
    const newCheckOut = format(addDays(date, duration), "yyyy-MM-dd");

    const { error } = await supabase
      .from("bookings")
      .update({
        room_id: roomId,
        check_in: newCheckIn,
        check_out: newCheckOut,
      })
      .eq("id", draggedBooking.id);

    if (error) {
      toast.error("Failed to update booking");
    } else {
      toast.success("Booking updated successfully");
      fetchData();
    }
    setDraggedBooking(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold">Room Calendar</h1>
            <p className="text-muted-foreground mt-2">Visual overview of room occupancy</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold min-w-[200px] text-center">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-4 items-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500"></div>
            <span>Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-500"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500/20 border border-blue-500"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500"></div>
            <span>Cancelled</span>
          </div>
        </div>

        <Card className="overflow-auto">
          <div className="min-w-max">
            <div className="grid grid-cols-[200px_repeat(auto-fill,minmax(50px,1fr))] border-b">
              <div className="p-4 font-semibold sticky left-0 bg-background border-r">Room</div>
              {daysInMonth.map((day) => (
                <div
                  key={day.toISOString()}
                  className="p-2 text-center text-sm border-r"
                >
                  <div className="font-semibold">{format(day, "d")}</div>
                  <div className="text-xs text-muted-foreground">{format(day, "EEE")}</div>
                </div>
              ))}
            </div>

            {rooms.map((room) => (
              <div
                key={room.id}
                className="grid grid-cols-[200px_repeat(auto-fill,minmax(50px,1fr))] border-b"
              >
                <div className="p-4 sticky left-0 bg-background border-r">
                  <div className="font-medium">{room.name}</div>
                  <div className="text-xs text-muted-foreground">{room.type}</div>
                </div>
                {daysInMonth.map((day) => {
                  const dayBookings = getBookingsForRoomAndDate(room.id, day);
                  const booking = dayBookings[0];
                  
                  if (booking && isBookingStart(booking, day)) {
                    const span = getBookingSpan(booking, day);
                    return (
                      <div
                        key={day.toISOString()}
                        className="relative p-1"
                        style={{ gridColumn: `span ${span}` }}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(room.id, day)}
                      >
                        <div
                          draggable
                          onDragStart={() => handleDragStart(booking)}
                          onClick={() => setSelectedBooking(booking)}
                          className={`${getStatusColor(
                            booking.status
                          )} border rounded px-2 py-1 text-xs cursor-move hover:opacity-80 transition-opacity`}
                        >
                          <div className="font-medium truncate">{booking.customer_name}</div>
                          <div className="truncate">{booking.booking_reference}</div>
                        </div>
                      </div>
                    );
                  }
                  
                  if (!booking) {
                    return (
                      <div
                        key={day.toISOString()}
                        className="border-r p-1 min-h-[60px] hover:bg-muted/50 transition-colors"
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(room.id, day)}
                      />
                    );
                  }
                  
                  return null;
                })}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Reference</p>
                  <p className="font-medium">{selectedBooking.booking_reference}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{selectedBooking.status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedBooking.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedBooking.customer_email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedBooking.customer_phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Guests</p>
                  <p className="font-medium">{selectedBooking.guests}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Check-in</p>
                  <p className="font-medium">
                    {format(new Date(selectedBooking.check_in), "MMM dd, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Check-out</p>
                  <p className="font-medium">
                    {format(new Date(selectedBooking.check_out), "MMM dd, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Price</p>
                  <p className="font-medium">${selectedBooking.total_price}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Calendar;
