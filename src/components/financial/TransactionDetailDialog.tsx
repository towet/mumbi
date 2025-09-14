import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Transaction } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
import { Trash2, Calendar, CreditCard, Hash, Tag, Wallet } from "lucide-react";

interface TransactionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  onSuccess?: () => void;
}

export function TransactionDetailDialog({ 
  open, 
  onOpenChange, 
  transaction, 
  onSuccess 
}: TransactionDetailDialogProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  
  if (!transaction) return null;
  
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', transaction.id);
      
      if (error) throw error;
      
      toast({
        title: "Transaction Deleted",
        description: "The transaction has been successfully deleted"
      });
      
      // Close the dialog and refresh the transactions list
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete transaction",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Format the date in a readable format
  const formattedDate = format(new Date(transaction.date), "PPP");
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center justify-between">
            <span className="truncate">{transaction.description}</span>
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
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex flex-col md:flex-row justify-between border-b pb-4 mb-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2 md:mb-0">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
            <div>
              <span className={cn(
                "text-lg font-semibold",
                transaction.type === "Income" ? "text-green-600" : "text-red-600"
              )}>
                {transaction.type === "Income" ? "+" : "-"}${transaction.amount.toFixed(2)}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-sm font-medium mb-1 flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                Category
              </h3>
              <p>{transaction.category}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-1 flex items-center">
                <Wallet className="h-4 w-4 mr-2" />
                Payment Method
              </h3>
              <p>{transaction.paymentMethod}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-1">Related To</h3>
              <p>
                {transaction.relatedTo === "Animal" && transaction.animalName
                  ? `${transaction.animalName} #${transaction.animalTag}`
                  : transaction.relatedTo}
              </p>
            </div>
            
            {transaction.reference && (
              <div>
                <h3 className="text-sm font-medium mb-1 flex items-center">
                  <Hash className="h-4 w-4 mr-2" />
                  Reference
                </h3>
                <p>{transaction.reference}</p>
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-1">Description</h3>
            <p className="text-sm">{transaction.description}</p>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Transaction
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
                  onClick={handleDelete}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DialogContent>
    </Dialog>
  );
}
