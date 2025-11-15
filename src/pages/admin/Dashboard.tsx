import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { DoorOpen, Calendar, Users, DollarSign, TrendingUp } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
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

  useEffect(() => {
    fetchStats();
    fetchAnalytics();
  }, []);

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
