
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Heart, Users, FileText, TrendingUp, TrendingDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from "@/components/ui/badge";

// Empty array for production - no mock data
const farmStatistics: { name: string; count: number }[] = [];

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  iconColor = "text-farm-green",
  gradientFrom = "from-farm-green/90",
  gradientTo = "to-emerald-500",
}: StatCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 border-transparent", 
        "hover:shadow-lg hover:scale-105 hover:border-farm-green/20",
        "active:scale-100 cursor-pointer",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      {/* Gradient overlay */}
      <div className={cn(
        "absolute inset-0 opacity-0 transition-opacity duration-300 z-0",
        "bg-gradient-to-br", gradientFrom, gradientTo,
        isHovered && "opacity-[0.03]"
      )} />
      
      <CardHeader className="flex flex-row items-center justify-between pb-1 relative z-10">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <div className={cn(
          "p-2.5 rounded-full transition-all duration-300",
          "bg-gradient-to-br", gradientFrom, gradientTo,
          "shadow-sm",
          isHovered && "shadow-md scale-110"
        )}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10 pt-1">
        <div className="text-xl sm:text-2xl font-bold transition-all duration-300">{value}</div>
        
        {description && (
          <p className="text-xs text-muted-foreground my-1">{description}</p>
        )}
        
        {trend && (
          <div className="flex items-center gap-1.5 mt-2">
            <Badge 
              variant="outline" 
              className={cn(
                "px-1.5 py-0 h-5 text-[10px] font-medium flex items-center gap-1",
                "border-0 transition-all duration-300",
                trend.isPositive ? 
                  "bg-emerald-50 text-emerald-600" : 
                  "bg-red-50 text-red-500"
              )}
            >
              {trend.isPositive ? 
                <TrendingUp className="h-3 w-3" /> : 
                <TrendingDown className="h-3 w-3" />}
              {trend.isPositive ? "+" : ""}{trend.value}%
            </Badge>
            <span className="text-[10px] text-muted-foreground">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export function DashboardStats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAnimals: {
      count: 0,
      trend: 0,
      description: "Animals in inventory"
    },
    healthStatus: {
      percent: 0,
      trend: 0,
      description: "Animals in good health"
    },
    monthlyRevenue: {
      amount: 0,
      trend: 0,
      description: "From sales & services"
    },
    pendingTasks: {
      count: 0,
      highPriority: 0,
      trend: 0
    }
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Get current date info for monthly calculations
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];
      
      // Last month date range for trend calculations
      const firstDayLastMonth = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0];
      const lastDayLastMonth = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];
      
      // 1. Fetch total animals count
      const { data: animalData, error: animalError } = await supabase
        .from('animals')
        .select('id, status', { count: 'exact' });
      
      // 2. Fetch animals count from last month for trend
      const { data: lastMonthAnimalCount, error: animalTrendError } = await supabase
        .from('animals')
        .select('id')
        .lt('created_at', firstDayOfMonth)
        .gte('created_at', firstDayLastMonth);
      
      // 3. Fetch monthly revenue (current month)
      const { data: revenueData, error: revenueError } = await supabase
        .from('financial_transactions')
        .select('amount, type')
        .eq('type', 'Income')
        .gte('date', firstDayOfMonth)
        .lte('date', lastDayOfMonth);
      
      // 4. Fetch last month's revenue for trend
      const { data: lastMonthRevenue, error: revenueTrendError } = await supabase
        .from('financial_transactions')
        .select('amount, type')
        .eq('type', 'Income')
        .gte('date', firstDayLastMonth)
        .lte('date', lastDayLastMonth);
      
      // 5. Fetch pending tasks
      const { data: taskData, error: taskError } = await supabase
        .from('alerts')
        .select('id, priority')
        .or('status.eq.Pending,status.eq.In Progress');
      
      // 6. Fetch last month's pending tasks count for trend
      const { data: lastMonthTasks, error: taskTrendError } = await supabase
        .from('alerts')
        .select('id')
        .or('status.eq.Pending,status.eq.In Progress')
        .lt('created_at', firstDayOfMonth)
        .gte('created_at', firstDayLastMonth);
      
      // Process the data
      if (!animalError && animalData) {
        const totalAnimals = animalData.length;
        const healthyAnimals = animalData.filter(animal => animal.status === 'Healthy' || animal.status === 'Active').length;
        const healthPercent = totalAnimals > 0 ? Math.round((healthyAnimals / totalAnimals) * 100) : 0;
        
        // Calculate trends
        const lastMonthAnimalsCount = lastMonthAnimalCount?.length || 0;
        const animalTrend = lastMonthAnimalsCount > 0 
          ? Math.round(((totalAnimals - lastMonthAnimalsCount) / lastMonthAnimalsCount) * 100)
          : 0;
        
        // Current month revenue
        const totalRevenue = revenueData?.reduce((sum, transaction) => {
          return sum + (typeof transaction.amount === 'number' ? 
            transaction.amount : parseFloat(transaction.amount) || 0);
        }, 0) || 0;
        
        // Last month revenue
        const lastMonthTotalRevenue = lastMonthRevenue?.reduce((sum, transaction) => {
          return sum + (typeof transaction.amount === 'number' ? 
            transaction.amount : parseFloat(transaction.amount) || 0);
        }, 0) || 0;
        
        const revenueTrend = lastMonthTotalRevenue > 0 
          ? Math.round(((totalRevenue - lastMonthTotalRevenue) / lastMonthTotalRevenue) * 100)
          : 0;
        
        // Tasks
        const pendingTasksCount = taskData?.length || 0;
        const highPriorityTasks = taskData?.filter(task => 
          task.priority === 'High' || task.priority === 'Urgent'
        ).length || 0;
        
        const lastMonthTasksCount = lastMonthTasks?.length || 0;
        const taskTrend = lastMonthTasksCount > 0 
          ? Math.round(((pendingTasksCount - lastMonthTasksCount) / lastMonthTasksCount) * 100)
          : 0;
        
        setStats({
          totalAnimals: {
            count: totalAnimals,
            trend: animalTrend,
            description: "Animals in inventory"
          },
          healthStatus: {
            percent: healthPercent,
            trend: 0, // We don't have previous health data for trend
            description: "Animals in good health"
          },
          monthlyRevenue: {
            amount: totalRevenue,
            trend: revenueTrend,
            description: "From sales & services"
          },
          pendingTasks: {
            count: pendingTasksCount,
            highPriority: highPriorityTasks,
            trend: taskTrend
          }
        });
      }
      
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Animals"
          value={loading ? "Loading..." : `${stats.totalAnimals.count}`}
          description={stats.totalAnimals.description}
          icon={Users}
          trend={{
            value: stats.totalAnimals.trend,
            isPositive: stats.totalAnimals.trend >= 0
          }}
          gradientFrom="from-blue-500/90"
          gradientTo="to-blue-600"
        />
        
        <StatCard
          title="Health Status"
          value={loading ? "Loading..." : `${stats.healthStatus.percent}%`}
          description={stats.healthStatus.description}
          icon={Heart}
          trend={{
            value: stats.healthStatus.trend,
            isPositive: stats.healthStatus.trend >= 0
          }}
          gradientFrom="from-rose-500/90"
          gradientTo="to-pink-600"
        />
        
        <StatCard
          title="Monthly Revenue"
          value={loading ? "Loading..." : `KSh ${stats.monthlyRevenue.amount.toLocaleString()}`}
          description={stats.monthlyRevenue.description}
          icon={Activity}
          trend={{
            value: stats.monthlyRevenue.trend,
            isPositive: stats.monthlyRevenue.trend >= 0
          }}
          gradientFrom="from-emerald-500/90"
          gradientTo="to-green-600"
        />
        
        <StatCard
          title="Pending Tasks"
          value={loading ? "Loading..." : `${stats.pendingTasks.count}`}
          description={`${stats.pendingTasks.highPriority} high priority`}
          icon={FileText}
          trend={{
            value: stats.pendingTasks.trend,
            isPositive: stats.pendingTasks.trend <= 0 // For tasks, negative trend is good
          }}
          gradientFrom="from-amber-500/90"
          gradientTo="to-orange-600"
        />
      </div>
      
      <Card className="border border-farm-green/10 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between border-b border-farm-green/5 pb-3">
          <div>
            <CardTitle className="text-lg bg-gradient-to-r from-farm-green to-emerald-500 bg-clip-text text-transparent">Flock Growth</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Latest trends in animal population</p>
          </div>
          <Badge 
            variant="outline" 
            className="bg-farm-green/5 border-farm-green/10 text-farm-green px-2 py-0 h-6"
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            +25% Year
          </Badge>
        </CardHeader>
        <CardContent className="p-0 sm:p-2 pt-4">
          <div className="h-[220px] sm:h-[280px] w-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={farmStatistics}
                margin={{
                  top: 10,
                  right: 20,
                  left: -25,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2E7D32" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#888' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#888' }}
                />
                <Tooltip 
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }}
                  itemStyle={{ color: '#2E7D32' }}
                  labelStyle={{ fontWeight: 'bold', color: '#333' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#2E7D32" 
                  strokeWidth={2}
                  fill="url(#colorGradient)" 
                  activeDot={{ stroke: '#fff', strokeWidth: 2, r: 6, fill: '#2E7D32' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
