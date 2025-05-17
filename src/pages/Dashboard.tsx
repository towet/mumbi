
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { FlockGrowthChart } from "@/components/dashboard/FlockGrowthChart";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, AlertCircle, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUpcomingTasks();
  }, []);
  
  async function fetchUpcomingTasks() {
    try {
      setLoading(true);
      const today = new Date();
      const threeMonthsLater = new Date();
      threeMonthsLater.setMonth(today.getMonth() + 3);
      
      // Format dates as YYYY-MM-DD for Supabase query
      const todayStr = today.toISOString().split('T')[0];
      const futureStr = threeMonthsLater.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('alerts')
        .select('*, animals(name, tag_number)')
        .or(`status.eq.Pending,status.eq.In Progress`)
        .gte('due_date', todayStr)
        .lte('due_date', futureStr)
        .order('due_date', { ascending: true })
        .limit(5);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setUpcomingTasks(data.map(task => ({
          id: task.id,
          title: task.title,
          date: format(new Date(task.due_date), 'PP'),
          dueDate: task.due_date,
          status: task.status,
          priority: task.priority,
          type: task.type,
          animalName: task.animals?.name,
          animalTag: task.animals?.tag_number
        })));
      } else {
        setUpcomingTasks([]);
      }
    } catch (error) {
      console.error('Error fetching upcoming tasks:', error);
      toast.error("Failed to load upcoming tasks");
      setUpcomingTasks([]);
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <Helmet>
        <title>Dashboard | Mumbi Farm Management</title>
      </Helmet>
      
      <div className="space-y-6">
        <section className="grid gap-4 md:gap-6 pb-20 sm:pb-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-farm-green to-emerald-600 bg-clip-text text-transparent">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Welcome back to Mumbi Farm Management</p>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 rounded-full border-farm-green/20 hover:bg-farm-green/5 hover:border-farm-green/30 transition-all duration-300 flex-1 sm:flex-auto justify-center"
              >
                <Calendar className="h-4 w-4 text-farm-green" />
                <span className="inline text-farm-green">Today</span>
              </Button>
            </div>
          </div>
          
          <DashboardStats />
          
          <div className="mt-4">
            <FlockGrowthChart />
          </div>
        </section>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2">
            <RecentActivities />
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 rounded-full border-2 border-farm-green border-t-transparent animate-spin"></div>
                      <p className="text-sm text-muted-foreground">Loading tasks...</p>
                    </div>
                  </div>
                ) : upcomingTasks.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingTasks.map((task) => (
                      <div 
                        key={task.id} 
                        className="flex justify-between py-3 px-3 border-b last:border-b-0 hover:bg-muted/30 transition-colors rounded-lg group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium group-hover:text-farm-green transition-colors">{task.title}</p>
                            {task.priority === "Urgent" && (
                              <Badge 
                                variant="destructive" 
                                className="text-xs flex items-center gap-1 bg-red-500/90 hover:bg-red-500 transition-colors shadow-sm"
                              >
                                <AlertCircle className="h-3 w-3" />
                                Urgent
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{task.date}</p>
                          {task.animalName && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <div className="h-2 w-2 rounded-full bg-farm-green/60"></div>
                              Related to: {task.animalName} #{task.animalTag}
                            </p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate('/alerts')}
                          className="opacity-80 hover:opacity-100 hover:bg-farm-green/10 hover:text-farm-green transition-all duration-300"
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 px-4">
                    <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <Bell className="h-8 w-8 text-muted-foreground/60" />
                    </div>
                    <p className="text-lg font-medium text-muted-foreground mb-2">No upcoming tasks</p>
                    <p className="text-sm text-muted-foreground/70 text-center mb-4">Add tasks to keep track of important farm activities</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/alerts')}
                      className="rounded-full border-farm-green/40 hover:border-farm-green text-farm-green hover:bg-farm-green/5 transition-all duration-300 px-6"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add a task
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
