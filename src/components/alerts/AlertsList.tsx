import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert } from "./types";
import { AlertCard } from "./AlertCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

interface AlertsListProps {
  onAddAlert: () => void;
}

export function AlertsList({ onAddAlert }: AlertsListProps) {
  const { toast: useToastHook } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  
  useEffect(() => {
    fetchAlerts();
  }, []);
  
  // Add a refresh flag to trigger alert reload
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Function to trigger a refresh
  const refreshAlerts = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  // Set the refresh trigger when adding a new alert
  useEffect(() => {
    const handleAlertAdded = () => {
      refreshAlerts();
    };
    
    // Listen for the custom alert-added event
    window.addEventListener('alert-added', handleAlertAdded);
    
    return () => {
      window.removeEventListener('alert-added', handleAlertAdded);
    };
  }, []);
  
  // Update fetch to use refresh trigger
  useEffect(() => {
    fetchAlerts();
  }, [refreshTrigger]);

  async function fetchAlerts() {
    try {
      setLoading(true);
      console.log('Fetching alerts from database...');
      
      // Attempt to get alerts from Supabase
      const { data, error } = await supabase
        .from('alerts')
        .select('*, animals(id, name, tag_number), profiles(id, first_name, last_name)')
        .order('due_date', { ascending: true });
      
      if (error) {
        console.error('Database error:', error);
        toast.error("Database Error", {
          description: "Failed to fetch alerts: " + error.message
        });
        setAlerts([]);
        return;
      }
      
      console.log('Alerts data received:', data); // Add this for debugging
      
      if (!data) {
        console.log('No data returned from database');
        setAlerts([]);
        return;
      }
      
      // Transform the data to match the expected format
      const formattedAlerts = data.map(alert => ({
        id: alert.id,
        title: alert.title,
        description: alert.description,
        type: alert.type as any,
        priority: alert.priority as any,
        status: alert.status as any,
        dueDate: alert.due_date,
        animalId: alert.animal_id || undefined,
        animalName: alert.animals?.name,
        animalTag: alert.animals?.tag_number,
        createdBy: alert.profiles ? `${alert.profiles.first_name} ${alert.profiles.last_name}` : undefined,
        createdAt: alert.created_at,
        updatedAt: alert.updated_at
      }));
      
      console.log('Formatted alerts:', formattedAlerts); // Add this for debugging
      setAlerts(formattedAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error("Error", {
        description: "Failed to load alerts"
      });
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }
  
  // Apply filters
  const filteredAlerts = alerts.filter(alert => {
    // Search filter
    const matchesSearch = 
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = 
      statusFilter === "all" ||
      alert.status === statusFilter;
    
    // Type filter
    const matchesType = 
      typeFilter === "all" ||
      alert.type === typeFilter;
    
    // Priority filter
    const matchesPriority = 
      priorityFilter === "all" ||
      alert.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });
  
  // Stats for the summary cards
  const pendingCount = alerts.filter(alert => alert.status === "Pending").length;
  const completedCount = alerts.filter(alert => alert.status === "Completed").length;
  const overdueCount = alerts.filter(alert => {
    if (alert.status === "Completed" || alert.status === "Cancelled") return false;
    const dueDate = new Date(alert.dueDate);
    const today = new Date();
    return dueDate < today;
  }).length;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              {pendingCount === 1 ? "task" : "tasks"} awaiting action
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">
              {completedCount === 1 ? "task" : "tasks"} completed successfully
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{overdueCount}</div>
            <p className="text-xs text-muted-foreground">
              {overdueCount === 1 ? "task" : "tasks"} past due date
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <CardTitle>Farm Alerts & Tasks</CardTitle>
              <CardDescription>Manage your farm activities and alerts</CardDescription>
            </div>
            <Button 
              className="mt-2 sm:mt-0 bg-farm-green hover:bg-farm-green/90"
              onClick={onAddAlert}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Alert
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search alerts..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Tabs 
                defaultValue="all" 
                value={statusFilter}
                onValueChange={setStatusFilter}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid grid-cols-4 w-full sm:w-[400px]">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="Pending">Pending</TabsTrigger>
                  <TabsTrigger value="In Progress">In Progress</TabsTrigger>
                  <TabsTrigger value="Completed">Completed</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <Select 
                  defaultValue="all"
                  value={typeFilter}
                  onValueChange={setTypeFilter}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Task">Task</SelectItem>
                    <SelectItem value="Reminder">Reminder</SelectItem>
                    <SelectItem value="Warning">Warning</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select 
                  defaultValue="all"
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading alerts...</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center border rounded-lg py-12">
              <p className="text-muted-foreground mb-2">No alerts found matching your filters</p>
              <Button 
                variant="link" 
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                  setPriorityFilter("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAlerts.map((alert) => (
                <AlertCard 
                  key={alert.id} 
                  alert={alert}
                  onStatusChange={fetchAlerts}
                  onDelete={fetchAlerts}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
