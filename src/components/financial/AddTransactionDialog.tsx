
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const formSchema = z.object({
  type: z.enum(["Income", "Expense"]),
  category: z.string().min(1, { message: "Category is required" }),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  date: z.date(),
  description: z.string().min(3, { message: "Description must be at least 3 characters" }),
  relatedTo: z.enum(["Animal", "Farm", "Other"]),
  animalId: z.string().optional(),
  paymentMethod: z.enum(["Cash", "Bank Transfer", "Credit Card", "Mobile Money", "Check", "Other"]),
  reference: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddTransactionDialog({ open, onOpenChange, onSuccess }: AddTransactionDialogProps) {
  // Using sonner toast
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animals, setAnimals] = useState<Array<{ id: string, name: string, tag: string }>>([]);
  
  // Fetch animals when dialog opens
  useEffect(() => {
    if (open) {
      fetchAnimals();
    }
  }, [open]);
  
  const fetchAnimals = async () => {
    try {
      const { data, error } = await supabase
        .from('animals')
        .select('id, name, tag_number');
      
      if (error) throw error;
      
      setAnimals(data.map(animal => ({
        id: animal.id,
        name: animal.name,
        tag: animal.tag_number
      })));
    } catch (error) {
      console.error('Error fetching animals:', error);
      // Fallback to empty array
      setAnimals([]);
    }
  };
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "Expense",
      category: "",
      amount: "",
      date: new Date(),
      description: "",
      relatedTo: "Farm",
      paymentMethod: "Cash",
      reference: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Prepare the data for Supabase
      const transactionData = {
        type: data.type,
        category: data.category,
        amount: parseFloat(data.amount),
        date: data.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        description: data.description,
        related_to: data.relatedTo,
        payment_method: data.paymentMethod,
        reference: data.reference || null,
        animal_id: data.relatedTo === 'Animal' ? data.animalId : null
      };
      
      // Get the current user if available
      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData?.user;
      
      // Add user info to transaction data
      const transactionWithUser = {
        ...transactionData,
        created_by: currentUser?.id || null
      };
      
      // Insert into Supabase with returning data to confirm
      const { data: insertedData, error } = await supabase
        .from('financial_transactions')
        .insert(transactionData)
        .select();
      
      if (!error && (!insertedData || insertedData.length === 0)) {
        throw new Error("Transaction was not saved properly");
      }
      
      if (error) throw error;
      
      toast.success("Transaction Added", {
        description: `Added ${data.type.toLowerCase()} of KSh ${data.amount} for ${data.category}`
      });
      
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
      
      // Call onSuccess callback to refresh the transactions list
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      toast.error("Database Error", {
        description: error.message || "Failed to add transaction"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchType = form.watch("type");
  const watchRelatedTo = form.watch("relatedTo");
  
  const expenseCategories = [
    "Feed",
    "Medication",
    "Veterinary Services",
    "Equipment",
    "Shearing",
    "Labor",
    "Transport",
    "Utilities",
    "Repairs",
    "Insurance",
    "Other"
  ];
  
  const incomeCategories = [
    "Sheep Sales",
    "Wool Sales",
    "Breeding Services",
    "Manure Sales",
    "Government Subsidies",
    "Insurance Claims",
    "Other"
  ];
  
  const categories = watchType === "Income" ? incomeCategories : expenseCategories;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add Transaction</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Type</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Reset category when type changes
                        form.setValue("category", "");
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Income">Income</SelectItem>
                        <SelectItem value="Expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">KSh</span>
                        <Input 
                          placeholder="0.00" 
                          {...field} 
                          className="pl-12"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="relatedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related To</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Animal">Specific Animal</SelectItem>
                        <SelectItem value="Farm">General Farm</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchRelatedTo === "Animal" && (
                <FormField
                  control={form.control}
                  name="animalId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Animal</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select animal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {animals.length > 0 ? (
                          animals.map(animal => (
                            <SelectItem key={animal.id} value={animal.id}>
                              {animal.name} (#{animal.tag})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>No animals found</SelectItem>
                        )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                        <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                        <SelectItem value="Check">Check</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Invoice #12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="col-span-1 md:col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter transaction details" 
                          className="min-h-[80px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-farm-green hover:bg-farm-green/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Add Transaction'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
