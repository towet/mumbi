
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Activity, 
  Calendar, 
  FileText, 
  Heart, 
  Home, 
  Settings, 
  Users,
  Bell,
  UserCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function AppSidebar() {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("/");
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location]);
  
  // Get user data from Supabase or localStorage
  useEffect(() => {
    const getUserData = async () => {
      // First try to get user from Supabase
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        // Get profile data if available
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();
            
          setUser({
            ...data.session.user,
            username: profileData?.username || data.session.user.email?.split('@')[0],
            role: profileData?.role || 'user'
          });
        } catch (error) {
          // Use basic user data if profile fetch fails
          setUser({
            ...data.session.user,
            username: data.session.user.email?.split('@')[0],
            role: 'user'
          });
        }
      } else {
        // Fall back to localStorage
        try {
          const storedUser = localStorage.getItem('mumbi_user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        } catch (error) {
          console.error("Error reading from localStorage:", error);
        }
      }
    };
    
    getUserData();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        getUserData(); // Refresh user data
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      path: "/",
    },
    {
      title: "Animals",
      icon: Users,
      path: "/animals",
    },
    {
      title: "Health Records",
      icon: Heart,
      path: "/health",
    },
    {
      title: "Events",
      icon: Calendar,
      path: "/events",
    },
    {
      title: "Finance",
      icon: Activity,
      path: "/finance",
    },
    {
      title: "Alerts",
      icon: Bell,
      path: "/alerts",
    },
    {
      title: "Reports",
      icon: FileText,
      path: "/reports",
    },
    {
      title: "Profile",
      icon: UserCircle,
      path: "/profile",
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/profile",
    },
  ];

  return (
    <div className="h-full border-r border-border bg-gradient-to-b from-slate-50 to-white shadow-md">
      <div className="mb-4 p-4">
        <div className="flex items-center gap-3 mb-6 pt-2">
          <div className="h-16 w-16 flex items-center justify-center transition-all duration-300 hover:scale-105">
            <img src="/Mumbi Farm Logo-01.png" alt="Mumbi Farm Logo" className="w-full h-full object-contain" />
          </div>
          <div className="space-y-1">
            <div className="font-semibold text-xl bg-gradient-to-r from-farm-green to-emerald-500 bg-clip-text text-transparent">Mumbi Farm</div>
            {user && (
              <div className="text-xs text-slate-500 pl-1">Welcome, {user.username || 'User'}</div>
            )}
          </div>
        </div>
      </div>
      
      <div className="px-2">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = activeItem === item.path || 
              (item.path !== "/" && activeItem.startsWith(item.path));
            
            return (
              <div key={item.path} className="my-1">
                <Link 
                  to={item.path} 
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 relative overflow-hidden group",
                    "hover:bg-gradient-to-r hover:from-farm-green/90 hover:to-emerald-500 hover:text-white hover:shadow-md hover:shadow-emerald-100 hover:translate-x-1",
                    isActive ? 
                      "bg-gradient-to-r from-farm-green to-emerald-500 text-white shadow-md shadow-emerald-100 translate-x-1" : 
                      "text-slate-700 hover:text-white"
                  )}
                >
                  <div className={cn(
                    "absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300",
                    "group-hover:opacity-20 rounded-lg"
                  )}></div>
                  
                  <div className={cn(
                    "relative z-10 flex items-center justify-center w-7 h-7 rounded-md transition-all duration-300",
                    isActive ? "bg-white/20" : "bg-farm-green/10 group-hover:bg-white/20",
                    "group-hover:scale-110"
                  )}>
                    <item.icon size={16} className={cn(
                      "transition-all duration-300",
                      isActive ? "text-white" : "text-farm-green group-hover:text-white",
                      "group-hover:animate-pulse"
                    )} />
                  </div>
                  
                  <span className="font-medium text-[15px]">{item.title}</span>
                  
                  {isActive && (
                    <div className="absolute left-0 top-1/2 h-8 w-1 bg-white rounded-r-full transform -translate-y-1/2"></div>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
