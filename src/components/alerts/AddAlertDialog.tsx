import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface AddAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(5, { message: "Description must be at least 5 characters" }),
  type: z.enum(["Task", "Reminder", "Warning", "Emergency"]),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]),
  status: z.enum(["Pending", "In Progress", "Completed", "Cancelled"]),
  dueDate: z.date(),
  relatedTo: z.enum(["None", "Animal"]),
  animalId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddAlertDialog({ open, onOpenChange, onSuccess }: AddAlertDialogProps) {
  const { toast: useToastHook } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animals, setAnimals] = useState<Array<{ id: string, name: string, tag: string }>>([]);
  const [isLoadingAnimals, setIsLoadingAnimals] = useState(false);
  const [animalFetchFailed, setAnimalFetchFailed] = useState(false);
  
  useEffect(() => {
    if (open) {
      fetchAnimals();
    }
  }, [open]);
  
  const fetchAnimals = async () => {
    setIsLoadingAnimals(true);
    setAnimalFetchFailed(false);
    
    try {
      const { data, error } = await supabase
        .from('animals')
        .select('id, name, tag_number');
      
      if (error) throw error;
      
      // Map the data to our format (will be empty array if no data)
      setAnimals(data?.map(animal => ({
        id: animal.id,
        name: animal.name,
        tag: animal.tag_number
      })) || []);
    } catch (error) {
      console.error('Error fetching animals:', error);
      setAnimalFetchFailed(true);
      toast.error("Database Error", {
        description: "Could not load animals from database"
      });
      setAnimals([]);
    } finally {
      setIsLoadingAnimals(false);
    }
  };
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "Task",
      priority: "Medium",
      status: "Pending",
      dueDate: new Date(),
      relatedTo: "None",
    },
  });
  
  const watchRelatedTo = form.watch("relatedTo");
  
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Get the current user if available
      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData?.user;
      
      // Verify animal exists if one is selected
      if (data.relatedTo === 'Animal' && data.animalId) {
        const { data: animalData, error: animalError } = await supabase
          .from('animals')
          .select('id')
          .eq('id', data.animalId)
          .single();
          
        if (animalError || !animalData) {
          throw new Error("Selected animal not found in database");
        }
      }
      
      // Prepare the data for Supabase with proper typing
      const alertData = {
        title: data.title,
        description: data.description,
        type: data.type,
        priority: data.priority,
        status: data.status,
        due_date: data.dueDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        animal_id: data.relatedTo === 'Animal' ? data.animalId : null,
        created_by: currentUser?.id || null
      };
      
      // Insert into Supabase with returning data to confirm
      const { data: insertedData, error } = await supabase
        .from('alerts')
        .insert(alertData)
        .select();
      
      if (error) throw error;
      
      if (!insertedData || insertedData.length === 0) {
        throw new Error("Alert was not saved properly");
      }
      
      toast.success("Alert Added", {
        description: `Added new ${data.priority.toLowerCase()} priority ${data.type.toLowerCase()}`
      });
      
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
      
      // Trigger alert-added event to refresh the alerts list
      window.dispatchEvent(new Event('alert-added'));
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error adding alert:', error);
      toast.error("Database Error", {
        description: error.message || "Failed to add alert"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add Alert or Task</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter alert or task title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Task">Task</SelectItem>
                        <SelectItem value="Reminder">Reminder</SelectItem>
                        <SelectItem value="Warning">Warning</SelectItem>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
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
                        <SelectItem value="None">General Farm</SelectItem>
                        <SelectItem value="Animal">Specific Animal</SelectItem>
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
                    <FormItem className="flex flex-col">
                      <FormLabel>Animal</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                animals.find((animal) => animal.id === field.value)?.name || "Select animal"
                              ) : (
                                "Select animal"
                              )}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                          <Command>
                            <CommandInput placeholder="Search animals..." />
                            <CommandList>
                              <CommandEmpty>
                                {animalFetchFailed ? 
                                  "Could not load animals. Please try again later." : 
                                  "No animal found with that name."}
                              </CommandEmpty>
                              <CommandGroup>
                                {isLoadingAnimals ? (
                                  <CommandItem key="loading">
                                    <span className="flex items-center gap-2">
                                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                                      Loading animals...
                                    </span>
                                  </CommandItem>
                                ) : animals.length === 0 ? (
                                  <CommandItem key="empty">
                                    No animals available
                                  </CommandItem>
                                ) : animals.map((animal) => (
                                  <CommandItem
                                    key={animal.id}
                                    value={animal.id}
                                    onSelect={() => {
                                      form.setValue("animalId", animal.id);
                                    }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      animal.id === field.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {animal.name} <span className="ml-2 text-gray-500">#{animal.tag}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter details about this alert or task" 
                          className="min-h-[100px]" 
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
                {isSubmitting ? 'Saving...' : 'Add Alert'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
