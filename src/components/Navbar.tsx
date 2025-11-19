import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Hotel, LogIn, User } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

const Navbar = () => {
  const location = useLocation();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          checkAdminStatus(session.user.id);
        } else {
          setIsAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    setIsAdmin(!!data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group transition-all duration-300 hover:scale-105">
            <Hotel className="h-6 w-6 text-accent transition-all duration-300 group-hover:rotate-12" />
            <span className="font-serif text-xl font-semibold transition-colors duration-300 group-hover:text-accent">City Business Hotel</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-all duration-300 hover:text-accent hover:scale-105 relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-accent after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100 ${
                isActive("/") ? "text-accent after:scale-x-100" : "text-foreground"
              }`}
            >
              Home
            </Link>
            <Link
              to="/rooms"
              className={`text-sm font-medium transition-all duration-300 hover:text-accent hover:scale-105 relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-accent after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100 ${
                isActive("/rooms") ? "text-accent after:scale-x-100" : "text-foreground"
              }`}
            >
              Rooms
            </Link>
            <Link
              to="/manage-booking"
              className={`text-sm font-medium transition-all duration-300 hover:text-accent hover:scale-105 relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-accent after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100 ${
                isActive("/manage-booking") ? "text-accent after:scale-x-100" : "text-foreground"
              }`}
            >
              Manage Booking
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <Button variant="ghost" size="sm" className="transition-all duration-300 hover:scale-105" asChild>
                  <Link to="/dashboard">
                    <User className="h-4 w-4 mr-2" />
                    My Dashboard
                  </Link>
                </Button>
                {isAdmin && (
                  <Button variant="outline" size="sm" className="transition-all duration-300 hover:scale-105 hover:border-accent" asChild>
                    <Link to="/admin/dashboard">Admin</Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="transition-all duration-300 hover:scale-105" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Button variant="default" size="sm" className="transition-all duration-300 hover:scale-105 hover-glow" asChild>
                <Link to="/auth">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;