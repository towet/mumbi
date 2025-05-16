
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
import { Download } from "lucide-react";

// Empty arrays for production - no mock data
const monthlyData: { name: string; income: number; expenses: number }[] = [];

const categoryData: { name: string; value: number }[] = [];

const expenseCategoryData: { name: string; value: number }[] = [];

export function FinancialSummary() {
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
                  <div className="text-2xl font-bold">$29,500</div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <span className="text-green-500 mr-1">↑ 12%</span> from last year
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
                  <div className="text-2xl font-bold">$18,200</div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <span className="text-red-500 mr-1">↑ 5%</span> from last year
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
                  <div className="text-2xl font-bold">$11,300</div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <span className="text-green-500 mr-1">↑ 18%</span> from last year
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
