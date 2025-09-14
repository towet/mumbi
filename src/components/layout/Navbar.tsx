
import { Bell, Search, User, Menu, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function Navbar({ className, menuButton }: { className?: string; menuButton?: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Load user data from Supabase or localStorage
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
  
  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear local storage
      localStorage.removeItem('mumbi_user');
      
      // Clear user state
      setUser(null);
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully"
      });
      
      // Navigate to login page
      navigate('/');
      
      // Force a complete page refresh to reset all application state
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Logout Failed",
        description: "An error occurred while logging out",
        variant: "destructive"
      });
    }
  };
  
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Vaccination Due",
      description: "Sheep ID #103 is due for vaccination",
      time: "10 minutes ago"
    },
    {
      id: 2,
      title: "Breeding Alert",
      description: "Ewe #205 is ready for breeding",
      time: "1 hour ago"
    },
    {
      id: 3,
      title: "Health Check Required",
      description: "Ram #156 needs a health inspection",
      time: "3 hours ago"
    }
  ]);
  
  // Add scroll effect to navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <nav className={cn(
      "h-16 border-b flex items-center justify-between px-4 sm:px-6 z-40 transition-all duration-300", 
      scrolled ? "bg-white/90 backdrop-blur-sm shadow-sm" : "bg-white",
      className
    )}>
      <div className="flex items-center gap-3">
        {menuButton && (
          <>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={menuButton}
              className="mr-2 block lg:hidden transition-all duration-300 text-farm-green hover:bg-farm-green/10 hover:text-farm-green rounded-md active:scale-95"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={menuButton}
              className="mr-2 hidden lg:flex hover:bg-farm-green/10"
            >
              <Menu className="h-5 w-5 text-farm-green" />
            </Button>
          </>
        )}
        
        <h1 className="font-semibold text-xl md:text-2xl bg-gradient-to-r from-farm-green to-emerald-600 bg-clip-text text-transparent transition-all duration-300 hidden sm:block">Mumbi Farm</h1>
        <h1 className="font-bold text-xl text-farm-green sm:hidden">MF</h1>
        
        <div className="hidden md:flex relative ml-4">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9 w-[180px] lg:w-[250px] bg-muted/30 transition-all duration-300 focus:w-[220px] lg:focus:w-[300px] rounded-full text-sm border-farm-green/20 focus:border-farm-green/50"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile search button */}
        <Button variant="ghost" size="icon" className="relative block md:hidden hover:bg-farm-green/10 transition-all duration-300">
          <Search className="h-5 w-5 text-farm-green" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-farm-green/10 transition-all duration-300"
            >
              <Bell className="h-5 w-5 text-farm-green" />
              <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-farm-green border-2 border-white animate-pulse"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[300px] sm:w-[350px] p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-farm-green to-emerald-600 p-3 text-white">
              <DropdownMenuLabel className="flex items-center justify-between p-0">
                <span className="text-lg">Notifications</span>
                <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 transition-colors">
                  {notifications.length} New
                </Badge>
              </DropdownMenuLabel>
            </div>
            
            <div className="max-h-[350px] overflow-auto">
              {notifications.map(notification => (
                <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3 border-b border-muted hover:bg-muted/50 cursor-pointer transition-colors">
                  <p className="font-medium text-farm-green">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                </DropdownMenuItem>
              ))}
            </div>
            
            <div className="p-2 bg-muted/20 border-t border-muted">
              <Button variant="ghost" size="sm" className="w-full text-center text-farm-green hover:text-farm-green hover:bg-farm-green/10">
                View all notifications
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 hover:bg-farm-green/10 transition-all duration-300">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-farm-green/90 to-emerald-500 flex items-center justify-center shadow-sm transition-transform hover:scale-105">
                <User className="h-5 w-5 text-white" />
              </div>
              <span className="hidden md:inline-block font-medium">{user?.username || 'Guest'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[220px] p-0 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-farm-green to-emerald-600 text-white">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-medium">{user?.username || 'Guest'}</p>
                  <p className="text-xs text-white/70">{user?.role || 'User'}</p>
                </div>
              </div>
            </div>
            
            <div className="p-2">
              <DropdownMenuItem className="p-3 focus:bg-farm-green/10 rounded-md mb-1" onSelect={() => {
                navigate('/profile');
              }}>
                <div className="flex items-center gap-2 w-full">
                  <div className="h-8 w-8 rounded-md bg-farm-green/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-farm-green" />
                  </div>
                  <span>Profile</span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="p-3 focus:bg-farm-green/10 rounded-md">
                <div className="flex items-center gap-2 w-full">
                  <div className="h-8 w-8 rounded-md bg-farm-green/10 flex items-center justify-center">
                    <Settings className="h-4 w-4 text-farm-green" />
                  </div>
                  <span>Settings</span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="my-2" />
              
              <DropdownMenuItem className="p-3 focus:bg-red-50 rounded-md text-red-600 hover:text-red-600 focus:text-red-600" onSelect={handleLogout}>
                <div className="flex items-center gap-2 w-full">
                  <div className="h-8 w-8 rounded-md bg-red-50 flex items-center justify-center">
                    <LogOut className="h-4 w-4 text-red-500" />
                  </div>
                  <span>Log out</span>
                </div>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
