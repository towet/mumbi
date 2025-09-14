
import { useState } from "react";
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
  FormDescription,
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
import { CalendarIcon, CheckIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface AddHealthRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  animals: Array<{ id: string; name: string; tag: string }>;
}

const formSchema = z.object({
  animalId: z.string().min(1, { message: "Animal ID is required" }),
  animalName: z.string().min(1, { message: "Animal name is required" }),
  animalTag: z.string().min(1, { message: "Animal tag is required" }),
  recordType: z.enum(["Vaccination", "Treatment", "Deworming", "Illness", "Check-up"]),
  date: z.date(),
  description: z.string().min(5, { message: "Description must be at least 5 characters" }),
  administeredBy: z.string().min(1, { message: "Administrator name is required" }),
  status: z.enum(["Completed", "Ongoing", "Scheduled", "Needs Follow-up"]),
  outcome: z.string().optional(),
  followUpDate: z.date().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddHealthRecordDialog({ open, onOpenChange, onSuccess, animals }: AddHealthRecordDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  /* No longer needed as animals are passed from props
  const [animals] = useState([
    { id: "MB001", name: "Fluffy", tag: "MB001" },
    { id: "MB087", name: "Apollo", tag: "MB087" },
    { id: "MB118", name: "Luna", tag: "MB118" },
    { id: "MB102", name: "Daisy", tag: "MB102" },
    { id: "MB203", name: "Max", tag: "MB203" },
  ]);
  */
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recordType: "Vaccination",
      date: new Date(),
      status: "Scheduled",
      outcome: "",
      followUpDate: null,
    },
  });

  const onSubmit = async (data: FormValues) => {
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
        notes: null
      };
      
      // Insert the data into Supabase
      const { error } = await supabase
        .from('health_records')
        .insert(healthRecordData);
      
      if (error) throw error;
      
      toast({
        title: "Health Record Added",
        description: `Added ${data.recordType} record for ${data.animalName}`,
      });
      
      // Reset the form and close the dialog
      form.reset();
      onOpenChange(false);
      
      // Refresh the health records list
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error adding health record:', error);
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
    const selectedAnimal = animals.find(animal => animal.id === animalId);
    if (selectedAnimal) {
      form.setValue("animalName", selectedAnimal.name);
      form.setValue("animalTag", selectedAnimal.tag);
    }
  };

  const recordType = form.watch("recordType");
  const needsOutcome = recordType === "Treatment" || recordType === "Illness";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add Health Record</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="animalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Animal</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleAnimalSelect(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select animal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {animals.map((animal) => (
                          <SelectItem key={animal.id} value={animal.id}>
                            {animal.name} (#{animal.tag})
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
                name="recordType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Record Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
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
                name="administeredBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Administered By</FormLabel>
                    <FormControl>
                      <Input placeholder="Dr. Smith" {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

              {(form.watch("status") === "Needs Follow-up") && (
                <FormField
                  control={form.control}
                  name="followUpDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Follow-up Date</FormLabel>
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
                                <span>Pick a follow-up date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="col-span-1 md:col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter details about the health record" 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {needsOutcome && (
                <div className="col-span-1 md:col-span-2">
                  <FormField
                    control={form.control}
                    name="outcome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Outcome</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter treatment outcome or current status" 
                            className="min-h-[80px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
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
                {isSubmitting ? "Saving..." : "Add Record"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
