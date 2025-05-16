
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
import { CalendarIcon, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@/components/ui/badge";

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  type: z.enum(["Birth", "Mating", "Weaning", "Shearing", "Vaccination", "Custom"]),
  date: z.date(),
  time: z.string().optional(),
  description: z.string().min(5, { message: "Description must be at least 5 characters" }),
  animals: z.array(z.string()).min(1, { message: "Select at least one animal" }),
  status: z.enum(["Upcoming", "In Progress", "Completed", "Missed"]),
});

type FormValues = z.infer<typeof formSchema>;

export function AddEventDialog({ open, onOpenChange, onSuccess }: AddEventDialogProps) {
  const { toast } = useToast();
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>([]);
  const [animalInput, setAnimalInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableAnimals, setAvailableAnimals] = useState<Array<{ id: string, name: string, tag: string }>>([]);
  
  // Fetch available animals when dialog opens
  useEffect(() => {
    if (open) {
      fetchAnimals();
    }
  }, [open]);
  
  async function fetchAnimals() {
    try {
      const { data, error } = await supabase
        .from('animals')
        .select('id, name, tag_number');
      
      if (error) throw error;
      
      setAvailableAnimals(data.map(animal => ({
        id: animal.id,
        name: animal.name,
        tag: animal.tag_number
      })));
    } catch (error) {
      console.error('Error fetching animals:', error);
      // Fallback to empty array
      setAvailableAnimals([
        { id: "MB001", name: "Fluffy", tag: "MB001" },
        { id: "MB087", name: "Apollo", tag: "MB087" },
      ]);
    }
  }
  
  /*const [availableAnimals] = useState([
    { id: "MB001", name: "Fluffy", tag: "MB001" },
    { id: "MB087", name: "Apollo", tag: "MB087" },
    { id: "MB118", name: "Luna", tag: "MB118" },
    { id: "MB102", name: "Daisy", tag: "MB102" },
    { id: "MB203", name: "Max", tag: "MB203" },
    { id: "Group1", name: "Spring Lambs", tag: "Group" },
    { id: "Group2", name: "Breeding Ewes", tag: "Group" },
    { id: "Group3", name: "Adult Rams", tag: "Group" },
  ]); // Replaced with actual data from Supabase
  */
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "Custom",
      date: new Date(),
      status: "Upcoming",
      animals: [],
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Prepare the data for Supabase
      const eventData: any = {
        event_type: data.type,
        description: data.title, // Use title as the description since it's more detailed
        date: data.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        performed_by: null, // Could be added later if user profiles are implemented
      };
      
      // Handle animal relationship
      if (data.animals.length > 0) {
        // Try to extract animal ID if it's a single specific animal (not a group)
        const animalMatch = data.animals[0].match(/#([\w\d]+)\)/);
        if (animalMatch) {
          // Find the animal by tag number
          const animal = availableAnimals.find(a => a.tag === animalMatch[1]);
          if (animal) {
            eventData.animal_id = animal.id;
          }
        }
      }
      
      // Store additional data in notes field as structured data
      eventData.notes = JSON.stringify({
        title: data.title,
        time: data.time,
        status: data.status,
        animals: data.animals,
      });
      
      // Insert into Supabase
      const { error } = await supabase
        .from('events')
        .insert(eventData);
      
      if (error) throw error;
      
      toast({
        title: "Event Added",
        description: `Added "${data.title}" event for ${data.date.toLocaleDateString()}`,
      });
      
      // Reset form and close dialog
      form.reset();
      setSelectedAnimals([]);
      onOpenChange(false);
      
      // Call onSuccess callback to refresh events list
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error adding event:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add event",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAnimal = (animal: string) => {
    if (!selectedAnimals.includes(animal) && animal.trim() !== "") {
      const newAnimals = [...selectedAnimals, animal];
      setSelectedAnimals(newAnimals);
      form.setValue("animals", newAnimals);
      setAnimalInput("");
    }
  };

  const removeAnimal = (animal: string) => {
    const newAnimals = selectedAnimals.filter(a => a !== animal);
    setSelectedAnimals(newAnimals);
    form.setValue("animals", newAnimals);
  };

  const handleSelectAnimal = (animalId: string) => {
    const animal = availableAnimals.find(a => a.id === animalId);
    if (animal) {
      const displayName = `${animal.name} (${animal.tag === "Group" ? "Group" : "#" + animal.tag})`;
      addAnimal(displayName);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add Event</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Birth">Birth</SelectItem>
                        <SelectItem value="Mating">Mating</SelectItem>
                        <SelectItem value="Weaning">Weaning</SelectItem>
                        <SelectItem value="Shearing">Shearing</SelectItem>
                        <SelectItem value="Vaccination">Vaccination</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
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
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type="time" {...field} />
                        <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
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
                        <SelectItem value="Upcoming">Upcoming</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Missed">Missed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="col-span-1 md:col-span-2">
                <FormField
                  control={form.control}
                  name="animals"
                  render={() => (
                    <FormItem>
                      <FormLabel>Animals Involved</FormLabel>
                      <div className="flex gap-2 mb-2">
                        <Select onValueChange={handleSelectAnimal}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select animals" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableAnimals.map((animal) => (
                              <SelectItem key={animal.id} value={animal.id}>
                                {animal.name} ({animal.tag === "Group" ? "Group" : "#" + animal.tag})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md bg-background">
                        {selectedAnimals.length === 0 && (
                          <div className="text-muted-foreground text-sm">No animals selected</div>
                        )}
                        {selectedAnimals.map((animal, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {animal}
                            <button 
                              type="button"
                              className="ml-1 rounded-full hover:bg-muted p-1"
                              onClick={() => removeAnimal(animal)}
                            >
                              <span>×</span>
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter event details" 
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
                {isSubmitting ? "Saving..." : "Add Event"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
