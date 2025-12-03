import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Rooms from "./pages/Rooms";
import Booking from "./pages/Booking";
import BookingSuccess from "./pages/BookingSuccess";
import ManageBooking from "./pages/ManageBooking";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import RoomDetail from "./pages/RoomDetail";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminRooms from "./pages/admin/Rooms";
import AdminReservations from "./pages/admin/Reservations";
import AdminCustomers from "./pages/admin/Customers";
import AdminCalendar from "./pages/admin/Calendar";
import AdminReports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/booking-success" element={<BookingSuccess />} />
          <Route path="/manage-booking" element={<ManageBooking />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/room/:roomId" element={<RoomDetail />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/rooms" element={<AdminRooms />} />
          <Route path="/admin/calendar" element={<AdminCalendar />} />
          <Route path="/admin/reservations" element={<AdminReservations />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
