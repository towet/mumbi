import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Edit, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Transaction } from "./types";
import { TransactionDetailDialog } from "./TransactionDetailDialog";

interface TransactionTableProps {
  onAddTransaction: () => void;
  onRefresh?: () => void;
}

export function TransactionTable({ onAddTransaction, onRefresh }: TransactionTableProps) {
  // Using sonner toast
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  
  // Categories based on database transactions
  const [incomeCategories, setIncomeCategories] = useState<string[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<string[]>([]);
  
  useEffect(() => {
    fetchTransactions();
  }, []);
  
  async function fetchTransactions() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*, animals(id, name, tag_number)')
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match our expected format
      const formattedTransactions = data.map(transaction => {
        // Handle amount parsing safely for both string and number types
        let parsedAmount = 0;
        
        if (typeof transaction.amount === 'number') {
          // If amount is already a number, use it directly
          parsedAmount = transaction.amount;
        } else if (typeof transaction.amount === 'string') {
          // If amount is a string, parse it safely
          try {
            parsedAmount = parseFloat(transaction.amount) || 0;
          } catch (err) {
            console.error(`Error parsing amount: ${transaction.amount}`, err);
            parsedAmount = 0;
          }
        }
        
        return {
          id: transaction.id,
          type: transaction.type as "Income" | "Expense",
          category: transaction.category,
          amount: parsedAmount,
          date: transaction.date,
          description: transaction.description,
          relatedTo: transaction.related_to as "Animal" | "Farm" | "Other",
          paymentMethod: transaction.payment_method,
          reference: transaction.reference || undefined,
          animalId: transaction.animal_id || undefined,
          animalName: transaction.animals?.name,
          animalTag: transaction.animals?.tag_number
        };
      });
      
      setTransactions(formattedTransactions);
      
      // Extract all unique categories
      const incomeCats = Array.from(new Set(
        formattedTransactions
          .filter(t => t.type === "Income")
          .map(t => t.category)
      ));
      
      const expenseCats = Array.from(new Set(
        formattedTransactions
          .filter(t => t.type === "Expense")
          .map(t => t.category)
      ));
      
      setIncomeCategories(incomeCats);
      setExpenseCategories(expenseCats);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error("Database Error", {
        description: "Failed to load financial transactions. Please try again."
      });
    } finally {
      setLoading(false);
    }
  }
  
  const handleDelete = async (id: string | number) => {
    try {
      setIsDeleting(true);
      
      // Convert id to string for consistency if it's a number
      const idValue = id.toString();
      
      const { error } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', idValue);
      
      if (error) throw error;
      
      toast.success("Transaction Deleted", {
        description: "Transaction has been removed"
      });
      
      // Refresh the transactions list
      fetchTransactions();
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      toast.error("Database Error", {
        description: error.message || "Failed to delete transaction"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Apply filters
  const filteredTransactions = transactions.filter(transaction => {
    // Text search filter
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.reference && transaction.reference.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Type filter
    const matchesType = 
      typeFilter === "all" || 
      (typeFilter === "income" && transaction.type === "Income") ||
      (typeFilter === "expense" && transaction.type === "Expense");
    
    // Category filter
    const matchesCategory = 
      categoryFilter === "all" || 
      transaction.category === categoryFilter;
    
    return matchesSearch && matchesType && matchesCategory;
  });
  
  // Calculate financial summary
  const totalIncome = filteredTransactions
    .filter(t => t.type === "Income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
    
  const totalExpenses = filteredTransactions
    .filter(t => t.type === "Expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
    
  const netBalance = totalIncome - totalExpenses;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search transactions..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Tabs 
            defaultValue="all" 
            className="w-[300px]"
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as "all" | "income" | "expense")}
          >
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expense">Expense</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Select 
            defaultValue="all"
            value={categoryFilter}
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger className="min-w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {typeFilter !== "expense" && (
                <>
                  <SelectItem value="Income" disabled className="font-semibold">
                    Income Categories
                  </SelectItem>
                  {incomeCategories.map(category => (
                    <SelectItem key={`income-${category}`} value={category} className="pl-6">
                      {category}
                    </SelectItem>
                  ))}
                </>
              )}
              {typeFilter !== "income" && (
                <>
                  <SelectItem value="Expense" disabled className="font-semibold">
                    Expense Categories
                  </SelectItem>
                  {expenseCategories.map(category => (
                    <SelectItem key={`expense-${category}`} value={category} className="pl-6">
                      {category}
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
          
          <Button 
            className="flex items-center gap-2 bg-farm-green hover:bg-farm-green/90"
            onClick={onAddTransaction}
          >
            Add Transaction
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg bg-green-50 border-green-100">
          <p className="text-sm text-muted-foreground">Total Income</p>
          <p className="text-2xl font-bold text-green-600">KSh {totalIncome.toFixed(2)}</p>
        </div>
        <div className="p-4 border rounded-lg bg-red-50 border-red-100">
          <p className="text-sm text-muted-foreground">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">KSh {totalExpenses.toFixed(2)}</p>
        </div>
        <div className="p-4 border rounded-lg bg-blue-50 border-blue-100">
          <p className="text-sm text-muted-foreground">Net Balance</p>
          <p className={cn(
            "text-2xl font-bold",
            netBalance >= 0 ? "text-blue-600" : "text-red-600"
          )}>
            KSh {netBalance.toFixed(2)}
          </p>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center border rounded-md py-12">
          <p className="text-muted-foreground">No transactions found matching your filters</p>
          <Button 
            variant="link" 
            onClick={() => {
              setSearchQuery("");
              setTypeFilter("all");
              setCategoryFilter("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {format(new Date(transaction.date), "PP")}
                  </TableCell>
                  <TableCell className="max-w-[250px] truncate">
                    {transaction.description}
                    {transaction.animalName && (
                      <span className="text-xs text-muted-foreground block">
                        Related to: {transaction.animalName} #{transaction.animalTag}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        transaction.type === "Income"
                          ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
                      }
                    >
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className={cn(
                      "text-[15px] font-medium",
                      transaction.type === "Income" ? "text-green-600" : "text-red-600"
                    )}>
                      {transaction.type === "Income" ? "+" : "-"} KSh {transaction.amount.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowDetailDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this transaction? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-500 hover:bg-red-600"
                              disabled={isDeleting}
                              onClick={() => handleDelete(transaction.id)}
                            >
                              {isDeleting ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {selectedTransaction && (
        <TransactionDetailDialog
          open={showDetailDialog}
          onOpenChange={setShowDetailDialog}
          transaction={selectedTransaction}
          onSuccess={fetchTransactions}
        />
      )}
    </div>
  );
}
