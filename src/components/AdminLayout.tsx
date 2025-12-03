import { ReactNode, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Hotel, 
  LayoutDashboard, 
  DoorOpen, 
  Calendar, 
  Users, 
  LogOut, 
  CalendarDays,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/rooms", label: "Rooms", icon: DoorOpen },
  { path: "/admin/calendar", label: "Calendar", icon: CalendarDays },
  { path: "/admin/reservations", label: "Reservations", icon: Calendar },
  { path: "/admin/customers", label: "Customers", icon: Users },
  { path: "/admin/reports", label: "Reports", icon: BarChart3 },
  { path: "/admin/settings", label: "Settings", icon: Settings },
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminName, setAdminName] = useState("");

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

      // Get admin profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", session.user.id)
        .maybeSingle();

      setAdminName(profile?.full_name || profile?.email || "Admin");
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

  const getCurrentPageTitle = () => {
    const currentItem = navItems.find(item => item.path === location.pathname);
    return currentItem?.label || "Admin Panel";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen bg-card border-r border-border transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-64" : "w-20",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        <div className={cn("p-4 border-b border-border", !sidebarOpen && "px-2")}>
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Hotel className="h-6 w-6 text-primary" />
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <div className="font-serif text-lg font-semibold truncate">City Business</div>
                <div className="text-xs text-muted-foreground">Admin Panel</div>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant={isActive(item.path) ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11",
                  !sidebarOpen && "justify-center px-0",
                  isActive(item.path) && "bg-primary/10 text-primary hover:bg-primary/20"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className={cn("p-4 border-t border-border", !sidebarOpen && "px-2")}>
          {sidebarOpen && (
            <div className="mb-4 p-3 rounded-lg bg-muted/50">
              <p className="text-sm font-medium truncate">{adminName}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          )}
          <Button 
            variant="ghost" 
            className={cn("w-full justify-start gap-3 text-muted-foreground hover:text-foreground", !sidebarOpen && "justify-center px-0")} 
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </Button>
        </div>

        {/* Collapse Button - Desktop */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex absolute -right-3 top-20 h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-sm hover:bg-muted transition-colors"
        >
          <ChevronRight className={cn("h-4 w-4 transition-transform", sidebarOpen && "rotate-180")} />
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-card/95 backdrop-blur border-b border-border flex items-center px-4 lg:px-8 gap-4">
          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden shrink-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Page Title & Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Link to="/admin/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              Admin
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{getCurrentPageTitle()}</span>
          </div>

          {/* Right side actions */}
          <div className="ml-auto flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                View Site
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 lg:p-8 max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;