import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Check, ChevronsUpDown, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HealthRecord {
  id: string;
  animalId: string;
  animalName: string;
  animalTag: string;
  recordType: "Vaccination" | "Treatment" | "Deworming" | "Illness" | "Check-up";
  date: Date;
  description: string;
  administeredBy: string;
  outcome?: string;
  followUp?: Date;
  status: "Completed" | "Ongoing" | "Scheduled" | "Needs Follow-up";
  notes?: string;
}

interface EditHealthRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  animals: Array<{ id: string; name: string; tag: string }>;
  record: HealthRecord | null;
}

const formSchema = z.object({
  animalId: z.string().min(1, { message: "Animal ID is required" }),
  animalName: z.string().optional(), // This is computed from animalId
  recordType: z.enum(["Vaccination", "Treatment", "Deworming", "Illness", "Check-up"]),
  date: z.date(),
  description: z.string().min(5, { message: "Description must be at least 5 characters" }),
  administeredBy: z.string().min(1, { message: "Administrator name is required" }),
  status: z.enum(["Completed", "Ongoing", "Scheduled", "Needs Follow-up"]),
  outcome: z.string().optional(),
  followUpDate: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function EditHealthRecordDialog({ open, onOpenChange, onSuccess, animals, record }: EditHealthRecordDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      animalId: "",
      recordType: "Vaccination",
      date: new Date(),
      description: "",
      administeredBy: "",
      status: "Completed",
    },
  });

  // Update form when record changes
  useEffect(() => {
    if (record) {
      form.reset({
        animalId: record.animalId,
        recordType: record.recordType,
        date: record.date,
        description: record.description,
        administeredBy: record.administeredBy,
        status: record.status,
        outcome: record.outcome || "",
        followUpDate: record.followUp,
      });

      // Update the animal name field
      const animal = animals.find(a => a.id === record.animalId);
      if (animal) {
        form.setValue("animalName", animal.name);
      }
    }
  }, [record, form, animals]);

  const onSubmit = async (data: FormValues) => {
    if (!record) return;
    
    setIsSubmitting(true);
    
    try {
      // Convert the data to match the database schema
      const healthRecordData = {
        animal_id: data.animalId,
        record_type: data.recordType,
        date: format(data.date, 'yyyy-MM-dd'),
        description: data.description,
        administered_by: data.administeredBy,
        status: data.status,
        outcome: data.outcome || null,
        follow_up: data.followUpDate ? format(data.followUpDate, 'yyyy-MM-dd') : null,
      };
      
      // Update the record in Supabase
      const { error } = await supabase
        .from('health_records')
        .update(healthRecordData)
        .eq('id', record.id);
      
      if (error) throw error;
      
      toast({
        title: "Health Record Updated",
        description: `Updated ${data.recordType} record for ${data.animalName || record.animalName}`,
      });
      
      // Close the dialog
      onOpenChange(false);
      
      // Refresh the health records list
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error updating health record:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnimalSelect = (animalId: string) => {
    form.setValue("animalId", animalId);
    
    // Find the animal to get its name
    const animal = animals.find(a => a.id === animalId);
    if (animal) {
      form.setValue("animalName", animal.name);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Health Record</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <PopoverContent className="p-0 w-full" align="start">
                      <Command>
                        <CommandInput placeholder="Search animals..." />
                        <CommandEmpty>No animal found.</CommandEmpty>
                        <CommandGroup className="max-h-60 overflow-y-auto">
                          {animals.map((animal) => (
                            <CommandItem
                              key={animal.id}
                              value={animal.id}
                              onSelect={() => handleAnimalSelect(animal.id)}
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
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="recordType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Record Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select record type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Vaccination">Vaccination</SelectItem>
                      <SelectItem value="Treatment">Treatment</SelectItem>
                      <SelectItem value="Deworming">Deworming</SelectItem>
                      <SelectItem value="Illness">Illness</SelectItem>
                      <SelectItem value="Check-up">Check-up</SelectItem>
                    </SelectContent>
                  </Select>
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
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Describe the health record..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="administeredBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Administered By</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Dr. Smith" />
                  </FormControl>
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Ongoing">Ongoing</SelectItem>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Needs Follow-up">Needs Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="outcome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Outcome (optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="Result of treatment or vaccination"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="followUpDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Follow-up Date (optional)</FormLabel>
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
                {isSubmitting ? "Saving..." : "Update Record"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
