
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function FinancialSummary() {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<{ name: string; income: number; expenses: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);
  const [expenseCategoryData, setExpenseCategoryData] = useState<{ name: string; value: number }[]>([]);
  const [financialSummary, setFinancialSummary] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    revenueGrowth: 0,
    expenseGrowth: 0,
    profitGrowth: 0
  });
  
  useEffect(() => {
    fetchFinancialData();
  }, []);
  
  async function fetchFinancialData() {
    try {
      setLoading(true);
      
      // Get transactions from database
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        toast.info("No financial data", {
          description: "No transactions found in the database"
        });
        setLoading(false);
        return;
      }
      
      // Calculate totals
      const income = data.filter(t => t.type === 'Income')
        .reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : parseFloat(t.amount) || 0), 0);
        
      const expenses = data.filter(t => t.type === 'Expense')
        .reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : parseFloat(t.amount) || 0), 0);
      
      const netProfit = income - expenses;
      
      setFinancialSummary({
        totalRevenue: income,
        totalExpenses: expenses,
        netProfit: netProfit,
        // For demo, use random growth percentages
        revenueGrowth: 12,
        expenseGrowth: 5,
        profitGrowth: 18
      });
      
      // Process monthly data
      const months = {};
      data.forEach(transaction => {
        // Extract month from date
        const month = new Date(transaction.date).toLocaleString('default', { month: 'short' });
        if (!months[month]) {
          months[month] = { income: 0, expenses: 0 };
        }
        
        const amount = typeof transaction.amount === 'number' ? 
          transaction.amount : parseFloat(transaction.amount) || 0;
          
        if (transaction.type === 'Income') {
          months[month].income += amount;
        } else {
          months[month].expenses += amount;
        }
      });
      
      const monthlyChartData = Object.keys(months).map(month => ({
        name: month,
        income: parseFloat(months[month].income.toFixed(2)),
        expenses: parseFloat(months[month].expenses.toFixed(2))
      }));
      
      setMonthlyData(monthlyChartData);
      
      // Process income by category
      const incomeCategories = {};
      data.filter(t => t.type === 'Income').forEach(transaction => {
        if (!incomeCategories[transaction.category]) {
          incomeCategories[transaction.category] = 0;
        }
        
        const amount = typeof transaction.amount === 'number' ? 
          transaction.amount : parseFloat(transaction.amount) || 0;
          
        incomeCategories[transaction.category] += amount;
      });
      
      const incomeCategoryData = Object.keys(incomeCategories).map(category => ({
        name: category,
        value: parseFloat(incomeCategories[category].toFixed(2))
      }));
      
      setCategoryData(incomeCategoryData);
      
      // Process expenses by category
      const expenseCategories = {};
      data.filter(t => t.type === 'Expense').forEach(transaction => {
        if (!expenseCategories[transaction.category]) {
          expenseCategories[transaction.category] = 0;
        }
        
        const amount = typeof transaction.amount === 'number' ? 
          transaction.amount : parseFloat(transaction.amount) || 0;
          
        expenseCategories[transaction.category] += amount;
      });
      
      const expenseCategoryData = Object.keys(expenseCategories).map(category => ({
        name: category,
        value: parseFloat(expenseCategories[category].toFixed(2))
      }));
      
      setExpenseCategoryData(expenseCategoryData);
    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast.error("Database Error", {
        description: "Failed to load financial data. Please try again."
      });
    } finally {
      setLoading(false);
    }
  }
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <CardTitle className="text-xl">Financial Overview</CardTitle>
            <CardDescription>Track income, expenses, and financial performance</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="mt-2 sm:mt-0">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Revenue (YTD)
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0">
                  <div className="text-2xl font-bold">
                    {loading ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading...
                      </div>
                    ) : (
                      `KSh ${financialSummary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <span className="text-green-500 mr-1">↑ {financialSummary.revenueGrowth}%</span> from last year
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Expenses (YTD)
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0">
                  <div className="text-2xl font-bold">
                    {loading ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading...
                      </div>
                    ) : (
                      `KSh ${financialSummary.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <span className="text-red-500 mr-1">↑ {financialSummary.expenseGrowth}%</span> from last year
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Net Profit (YTD)
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0">
                  <div className="text-2xl font-bold">
                    {loading ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading...
                      </div>
                    ) : (
                      `KSh ${financialSummary.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <span className="text-green-500 mr-1">↑ {financialSummary.profitGrowth}%</span> from last year
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="h-[300px] w-full">
              <p className="font-medium mb-2">Monthly Income vs Expenses</p>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="income" fill="#2E7D32" name="Income" />
                  <Bar dataKey="expenses" fill="#FF5722" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="income">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="font-medium mb-2">Income by Category</p>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#7CB342" name="Amount ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <p className="font-medium mb-2">Recent Transactions</p>
                <div className="space-y-4">
                  {[
                    { id: 1, date: "Aug 8, 2023", description: "Wool Sale - 45kg", amount: 1800 },
                    { id: 2, date: "Aug 2, 2023", description: "Sheep Sale - 5 Lambs", amount: 950 },
                    { id: 3, date: "Jul 28, 2023", description: "Breeding Service Fee", amount: 500 },
                    { id: 4, date: "Jul 15, 2023", description: "Farm Tour Revenue", amount: 350 },
                  ].map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">{transaction.date}</p>
                      </div>
                      <div className="text-green-600 font-medium">
                        +${transaction.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="expenses">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="font-medium mb-2">Expenses by Category</p>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={expenseCategoryData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#FF5722" name="Amount ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <p className="font-medium mb-2">Recent Expenses</p>
                <div className="space-y-4">
                  {[
                    { id: 1, date: "Aug 7, 2023", description: "Feed Purchase", amount: 850 },
                    { id: 2, date: "Aug 5, 2023", description: "Veterinary Services", amount: 420 },
                    { id: 3, date: "Jul 30, 2023", description: "Equipment Repair", amount: 250 },
                    { id: 4, date: "Jul 22, 2023", description: "Labor Costs", amount: 900 },
                  ].map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">{transaction.date}</p>
                      </div>
                      <div className="text-red-600 font-medium">
                        -${transaction.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
