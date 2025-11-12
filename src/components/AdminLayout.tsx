import { ReactNode, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Hotel, LayoutDashboard, DoorOpen, Calendar, Users, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to access admin panel");
        navigate("/auth");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/");
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error("Auth check error:", error);
      navigate("/auth");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="p-6">
          <Link to="/" className="flex items-center space-x-2 mb-8">
            <Hotel className="h-8 w-8 text-sidebar-primary" />
            <div>
              <div className="font-serif text-lg font-semibold">City Business Hotel</div>
              <div className="text-xs text-sidebar-foreground/70">Admin Panel</div>
            </div>
          </Link>

          <nav className="space-y-2">
            <Link to="/admin/dashboard">
              <Button
                variant={isActive("/admin/dashboard") ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link to="/admin/rooms">
              <Button
                variant={isActive("/admin/rooms") ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <DoorOpen className="h-4 w-4 mr-2" />
                Rooms
              </Button>
            </Link>
            <Link to="/admin/reservations">
              <Button
                variant={isActive("/admin/reservations") ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Reservations
              </Button>
            </Link>
            <Link to="/admin/customers">
              <Button
                variant={isActive("/admin/customers") ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <Users className="h-4 w-4 mr-2" />
                Customers
              </Button>
            </Link>
          </nav>
        </div>

        <div className="absolute bottom-0 w-64 p-6 border-t border-sidebar-border">
          <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-8">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;