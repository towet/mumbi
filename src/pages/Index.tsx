
import { useState, useEffect, useRef } from "react";
import { AppSidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { AppRoutes } from "@/routes/AppRoutes";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";

function MainLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside the sidebar to close it on mobile
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (isMobile && sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isMobile, sidebarOpen]);

  // Close sidebar on route change for mobile devices
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile]);

  // Detect mobile screen on resize
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // On larger screens, always ensure sidebar is open
      if (!mobile) {
        setSidebarOpen(true);
      }
    };
    
    // Initial check
    checkIfMobile();
    
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Toggle sidebar function to pass to navbar
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-gray-50 to-white">
      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] lg:w-72 bg-white border-r lg:relative lg:translate-x-0 transition-transform duration-300",
          isMobile ? (sidebarOpen ? "translate-x-0 shadow-xl" : "-translate-x-full") : "translate-x-0"
        )}
      >
        {/* Close button for mobile */}
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 z-50 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
        
        <div className="h-full overflow-y-auto">
          <AppSidebar />
        </div>
      </aside>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden w-full">
        <Navbar menuButton={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 transition-all duration-300 ease-in-out">
          <AppRoutes />
        </main>
      </div>
    </div>
  );
}

export default function Index() {
  return (
    <>
      <Helmet>
        <title>Mumbi Farm Management System</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Helmet>
      
      <MainLayout />
    </>
  );
}
