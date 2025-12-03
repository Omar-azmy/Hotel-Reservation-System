import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Download, TrendingUp, TrendingDown, DollarSign, CreditCard, Calendar, Percent } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subDays, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval, isWithinInterval } from "date-fns";

interface RevenueData {
  period: string;
  revenue: number;
  bookings: number;
}

interface RoomTypeRevenue {
  type: string;
  revenue: number;
  percentage: number;
}

const AdminReports = () => {
  const [period, setPeriod] = useState("30days");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    avgBookingValue: 0,
    revenueChange: 0,
    bookingsChange: 0,
    occupancyRate: 0,
    avgStayDuration: 0,
  });
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [roomTypeRevenue, setRoomTypeRevenue] = useState<RoomTypeRevenue[]>([]);
  const [paymentStatusData, setPaymentStatusData] = useState<{ status: string; count: number }[]>([]);

  useEffect(() => {
    fetchReports();
  }, [period]);

  const getDateRange = () => {
    const now = new Date();
    switch (period) {
      case "7days":
        return { start: subDays(now, 7), end: now };
      case "30days":
        return { start: subDays(now, 30), end: now };
      case "90days":
        return { start: subDays(now, 90), end: now };
      case "12months":
        return { start: subMonths(now, 12), end: now };
      default:
        return { start: subDays(now, 30), end: now };
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    const { start, end } = getDateRange();
    const previousStart = new Date(start.getTime() - (end.getTime() - start.getTime()));

    // Fetch bookings for current period
    const { data: currentBookings } = await supabase
      .from("bookings")
      .select("*, rooms(type, price_per_night)")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString());

    // Fetch bookings for previous period (for comparison)
    const { data: previousBookings } = await supabase
      .from("bookings")
      .select("*")
      .gte("created_at", previousStart.toISOString())
      .lt("created_at", start.toISOString());

    // Fetch all rooms for occupancy calculation
    const { data: rooms } = await supabase.from("rooms").select("*");

    const validBookings = (currentBookings || []).filter(
      (b) => b.status === "confirmed" || b.status === "completed"
    );
    const previousValidBookings = (previousBookings || []).filter(
      (b) => b.status === "confirmed" || b.status === "completed"
    );

    // Calculate stats
    const totalRevenue = validBookings.reduce((sum, b) => sum + Number(b.total_price), 0);
    const previousRevenue = previousValidBookings.reduce((sum, b) => sum + Number(b.total_price), 0);
    const avgBookingValue = validBookings.length > 0 ? totalRevenue / validBookings.length : 0;
    
    const revenueChange = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;
    const bookingsChange = previousValidBookings.length > 0 
      ? ((validBookings.length - previousValidBookings.length) / previousValidBookings.length) * 100 
      : 0;

    // Calculate average stay duration
    const totalNights = validBookings.reduce((sum, b) => {
      const checkIn = new Date(b.check_in);
      const checkOut = new Date(b.check_out);
      return sum + Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);
    const avgStayDuration = validBookings.length > 0 ? totalNights / validBookings.length : 0;

    // Calculate occupancy rate
    const daysInPeriod = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalRoomNights = (rooms?.length || 0) * daysInPeriod;
    const bookedNights = totalNights;
    const occupancyRate = totalRoomNights > 0 ? (bookedNights / totalRoomNights) * 100 : 0;

    setStats({
      totalRevenue,
      avgBookingValue,
      revenueChange,
      bookingsChange,
      occupancyRate,
      avgStayDuration,
    });

    // Generate revenue over time data
    let timeData: RevenueData[] = [];
    if (period === "12months") {
      const months = eachMonthOfInterval({ start, end });
      timeData = months.map((month) => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const monthBookings = validBookings.filter((b) =>
          isWithinInterval(new Date(b.created_at), { start: monthStart, end: monthEnd })
        );
        return {
          period: format(month, "MMM yy"),
          revenue: monthBookings.reduce((sum, b) => sum + Number(b.total_price), 0),
          bookings: monthBookings.length,
        };
      });
    } else {
      const days = eachDayOfInterval({ start, end });
      const groupedDays = period === "7days" ? days : days.filter((_, i) => i % (period === "90days" ? 7 : 1) === 0);
      timeData = groupedDays.map((day) => {
        const dayBookings = validBookings.filter((b) => {
          const bookingDate = new Date(b.created_at);
          return bookingDate.toDateString() === day.toDateString();
        });
        return {
          period: format(day, period === "90days" ? "MMM d" : "MMM d"),
          revenue: dayBookings.reduce((sum, b) => sum + Number(b.total_price), 0),
          bookings: dayBookings.length,
        };
      });
    }
    setRevenueData(timeData);

    // Revenue by room type
    const roomTypes = ["standard", "deluxe", "executive_suite"];
    const typeRevenue = roomTypes.map((type) => {
      const typeBookings = validBookings.filter((b) => b.rooms?.type === type);
      const revenue = typeBookings.reduce((sum, b) => sum + Number(b.total_price), 0);
      return {
        type: type === "executive_suite" ? "Executive Suite" : type.charAt(0).toUpperCase() + type.slice(1),
        revenue,
        percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
      };
    });
    setRoomTypeRevenue(typeRevenue);

    // Payment status distribution
    const statusCounts = (currentBookings || []).reduce((acc: Record<string, number>, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {});
    setPaymentStatusData(
      Object.entries(statusCounts).map(([status, count]) => ({ status, count }))
    );

    setLoading(false);
  };

  const exportReport = () => {
    const csvContent = [
      ["Metric", "Value"],
      ["Total Revenue", `$${stats.totalRevenue.toFixed(2)}`],
      ["Average Booking Value", `$${stats.avgBookingValue.toFixed(2)}`],
      ["Revenue Change", `${stats.revenueChange.toFixed(1)}%`],
      ["Occupancy Rate", `${stats.occupancyRate.toFixed(1)}%`],
      ["Average Stay Duration", `${stats.avgStayDuration.toFixed(1)} nights`],
      [""],
      ["Period", "Revenue", "Bookings"],
      ...revenueData.map((d) => [d.period, `$${d.revenue.toFixed(2)}`, d.bookings.toString()]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revenue-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  const COLORS = ["hsl(220, 70%, 50%)", "hsl(160, 60%, 45%)", "hsl(30, 80%, 55%)", "hsl(280, 65%, 60%)"];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold">Revenue Reports</h1>
            <p className="text-muted-foreground mt-2">Financial analytics and performance metrics</p>
          </div>
          <div className="flex gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="12months">Last 12 Months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading reports...</p>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                  <div className={`flex items-center text-xs mt-1 ${stats.revenueChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {stats.revenueChange >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {Math.abs(stats.revenueChange).toFixed(1)}% vs previous period
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Avg Booking Value</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.avgBookingValue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Per confirmed booking</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                  <Percent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.occupancyRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground mt-1">Room nights booked</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Avg Stay Duration</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.avgStayDuration.toFixed(1)} nights</div>
                  <p className="text-xs text-muted-foreground mt-1">Average booking length</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Over Time</CardTitle>
                  <CardDescription>Revenue trend for the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                      />
                      <Area type="monotone" dataKey="revenue" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Room Type</CardTitle>
                  <CardDescription>Distribution across room categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={roomTypeRevenue}
                        dataKey="revenue"
                        nameKey="type"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ type, percentage }) => `${type}: ${percentage.toFixed(0)}%`}
                      >
                        {roomTypeRevenue.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bookings Over Time</CardTitle>
                  <CardDescription>Number of bookings for the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                      <Bar dataKey="bookings" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Booking Status Distribution</CardTitle>
                  <CardDescription>Current status of all bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={paymentStatusData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis type="category" dataKey="status" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                      <Bar dataKey="count" fill={COLORS[2]} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReports;