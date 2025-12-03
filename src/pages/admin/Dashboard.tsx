import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { DoorOpen, Calendar, Users, DollarSign, TrendingUp, ArrowRight, Plus, Eye, BarChart3 } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";

interface BookingTrend {
  month: string;
  bookings: number;
  revenue: number;
}

interface RoomOccupancy {
  type: string;
  occupancy: number;
  total: number;
}

interface PopularRoom {
  name: string;
  bookings: number;
}

interface RecentBooking {
  id: string;
  booking_reference: string;
  customer_name: string;
  status: string;
  total_price: number;
  created_at: string;
  rooms?: { name: string };
}

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    totalBookings: 0,
    activeBookings: 0,
    totalRevenue: 0,
    totalCustomers: 0,
  });
  const [bookingTrends, setBookingTrends] = useState<BookingTrend[]>([]);
  const [roomOccupancy, setRoomOccupancy] = useState<RoomOccupancy[]>([]);
  const [popularRooms, setPopularRooms] = useState<PopularRoom[]>([]);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);

  useEffect(() => {
    fetchStats();
    fetchAnalytics();
    fetchRecentBookings();
  }, []);

  const fetchRecentBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("id, booking_reference, customer_name, status, total_price, created_at, rooms(name)")
      .order("created_at", { ascending: false })
      .limit(5);
    setRecentBookings(data || []);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-500/10 text-green-700 border-green-500/20";
      case "pending": return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
      case "cancelled": return "bg-red-500/10 text-red-700 border-red-500/20";
      case "completed": return "bg-blue-500/10 text-blue-700 border-blue-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const fetchStats = async () => {
    const [roomsData, bookingsData, customersData] = await Promise.all([
      supabase.from("rooms").select("*"),
      supabase.from("bookings").select("*"),
      supabase.from("profiles").select("id"),
    ]);

    const rooms = roomsData.data || [];
    const bookings = bookingsData.data || [];
    const customers = customersData.data || [];

    const activeBookings = bookings.filter(
      (b) => b.status === "confirmed" || b.status === "pending"
    );
    const revenue = bookings
      .filter((b) => b.status === "confirmed" || b.status === "completed")
      .reduce((sum, b) => sum + Number(b.total_price), 0);

    setStats({
      totalRooms: rooms.length,
      availableRooms: rooms.filter((r) => r.is_available).length,
      totalBookings: bookings.length,
      activeBookings: activeBookings.length,
      totalRevenue: revenue,
      totalCustomers: customers.length,
    });
  };

  const fetchAnalytics = async () => {
    // Fetch booking trends for the last 6 months
    const sixMonthsAgo = subMonths(new Date(), 6);
    const months = eachMonthOfInterval({
      start: sixMonthsAgo,
      end: new Date(),
    });

    const { data: bookings } = await supabase
      .from("bookings")
      .select("*, rooms(name, type)")
      .gte("created_at", sixMonthsAgo.toISOString());

    // Calculate booking trends
    const trends = months.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthBookings = (bookings || []).filter((b) => {
        const bookingDate = new Date(b.created_at);
        return bookingDate >= monthStart && bookingDate <= monthEnd;
      });

      const monthRevenue = monthBookings
        .filter((b) => b.status === "confirmed" || b.status === "completed")
        .reduce((sum, b) => sum + Number(b.total_price), 0);

      return {
        month: format(month, "MMM yyyy"),
        bookings: monthBookings.length,
        revenue: monthRevenue,
      };
    });
    setBookingTrends(trends);

    // Calculate room occupancy by type
    const { data: rooms } = await supabase.from("rooms").select("*");
    const roomTypes = ["standard", "deluxe", "executive_suite"];
    
    const occupancyData = roomTypes.map((type) => {
      const typeRooms = (rooms || []).filter((r) => r.type === type);
      const typeBookings = (bookings || []).filter(
        (b) => b.rooms?.type === type && (b.status === "confirmed" || b.status === "pending")
      );
      
      return {
        type: type === "executive_suite" ? "Executive Suite" : type.charAt(0).toUpperCase() + type.slice(1),
        occupancy: typeBookings.length,
        total: typeRooms.length,
      };
    });
    setRoomOccupancy(occupancyData);

    // Calculate most popular rooms
    const roomBookingCounts = (rooms || []).map((room) => {
      const roomBookings = (bookings || []).filter((b) => b.room_id === room.id);
      return {
        name: room.name,
        bookings: roomBookings.length,
      };
    });
    const sortedRooms = roomBookingCounts.sort((a, b) => b.bookings - a.bookings).slice(0, 5);
    setPopularRooms(sortedRooms);
  };

  const COLORS = {
    primary: "hsl(var(--primary))",
    accent: "hsl(var(--accent))",
    muted: "hsl(var(--muted-foreground))",
    chart1: "hsl(220, 70%, 50%)",
    chart2: "hsl(160, 60%, 45%)",
    chart3: "hsl(30, 80%, 55%)",
    chart4: "hsl(280, 65%, 60%)",
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-2">Comprehensive overview of hotel performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
              <DoorOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRooms}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.availableRooms} available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeBookings}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalBookings} total bookings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">From confirmed bookings</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/admin/rooms">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Room
                </Button>
              </Link>
              <Link to="/admin/reservations">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Eye className="h-4 w-4" />
                  View All Reservations
                </Button>
              </Link>
              <Link to="/admin/reports">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Generate Report
                </Button>
              </Link>
              <Link to="/admin/calendar">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Calendar className="h-4 w-4" />
                  View Calendar
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Bookings</CardTitle>
              <Link to="/admin/reservations">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentBookings.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No recent bookings</p>
              ) : (
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{booking.customer_name}</span>
                          <Badge variant="outline" className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {booking.rooms?.name} • {booking.booking_reference}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${Number(booking.total_price).toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(booking.created_at), "MMM d, h:mm a")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1: Booking Trends and Revenue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Trends</CardTitle>
              <CardDescription>Number of bookings over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={bookingTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke={COLORS.chart1}
                    strokeWidth={2}
                    dot={{ fill: COLORS.chart1 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Statistics</CardTitle>
              <CardDescription>Revenue trends over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={bookingTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={COLORS.chart2}
                    fill={COLORS.chart2}
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2: Occupancy and Popular Rooms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Occupancy by Room Type</CardTitle>
              <CardDescription>Current occupancy rates across different room categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roomOccupancy}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="type" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="occupancy" fill={COLORS.chart3} name="Occupied" />
                  <Bar dataKey="total" fill={COLORS.muted} name="Total Rooms" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Most Popular Rooms</CardTitle>
              <CardDescription>Top 5 rooms by number of bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={popularRooms} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    type="number"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    width={100}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Bar dataKey="bookings" fill={COLORS.chart4} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
