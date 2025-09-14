
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const breeds = [
  "Merino",
  "Suffolk",
  "Dorper",
  "Corriedale",
  "Romney",
  "Blackhead Persian",
  "Dorset",
  "Hampshire",
  "Texel",
  "Border Leicester",
];

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  tagNumber: z.string().min(1, {
    message: "Tag number is required.",
  }),
  sex: z.enum(["Male", "Female"]),
  dob: z.date({
    required_error: "Date of birth is required.",
  }),
  breed: z.string({
    required_error: "Please select a breed.",
  }),
  weightAtBirth: z.coerce.number().min(0.1),
  origin: z.enum(["birth", "purchase", "import"]),
  stateAtBirth: z.string().optional(),
  fatherId: z.string().optional(),
  motherId: z.string().optional(),
  color: z.string().optional(),
  description: z.string().optional(),
});

export default function AnimalRegistrationForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      tagNumber: "",
      sex: "Female",
      origin: "birth",
      breed: "",
      weightAtBirth: 0,
      stateAtBirth: "",
      fatherId: "",
      motherId: "",
      color: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      // Map the form values to match the Supabase database schema
      const animalData = {
        name: values.name,
        tag_number: values.tagNumber,
        breed: values.breed,
        sex: values.sex,
        status: "Active", // Default status for new animals
        age: calculateAge(values.dob),
        birth_date: format(values.dob, "yyyy-MM-dd"),
        weight_kg: values.weightAtBirth,
        health_status: "Healthy", // Default health status for new animals
        notes: formatNotes(values)
      };
      
      // Insert the data into Supabase
      const { data, error } = await supabase
        .from('animals')
        .insert(animalData)
        .select();
      
      if (error) throw error;
      
      toast.success("Animal registered successfully", {
        description: `${values.name} has been added to the flock.`,
      });
      
      // Navigate back to the animals list
      navigate("/animals");
    } catch (error: any) {
      console.error('Error registering animal:', error);
      toast.error("Failed to register animal", {
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  // Helper function to calculate age from DOB
  function calculateAge(dob: Date): string {
    const today = new Date();
    let years = today.getFullYear() - dob.getFullYear();
    const months = today.getMonth() - dob.getMonth();
    
    if (months < 0 || (months === 0 && today.getDate() < dob.getDate())) {
      years--;
    }
    
    if (years === 0) {
      const monthDiff = (today.getMonth() + 12 - dob.getMonth()) % 12;
      return `${monthDiff} ${monthDiff === 1 ? 'month' : 'months'}`;
    }
    
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  }
  
  // Helper function to format additional notes
  function formatNotes(values: z.infer<typeof formSchema>): string {
    let notes = values.description || '';
    
    // Add additional data to notes
    const additionalInfo = [
      values.stateAtBirth && `State at birth: ${values.stateAtBirth}`,
      values.fatherId && `Father ID: ${values.fatherId}`,
      values.motherId && `Mother ID: ${values.motherId}`,
      values.color && `Color/Markings: ${values.color}`,
      values.origin && `Origin: ${values.origin === 'birth' ? 'Born on farm' : values.origin === 'purchase' ? 'Purchased' : 'Imported'}`
    ].filter(Boolean).join('\n');
    
    return notes + (notes && additionalInfo ? '\n\n' : '') + additionalInfo;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter sheep name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="tagNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tag Number (ID)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter unique tag number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="sex"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Sex</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-6"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="Female" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Female
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="Male" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Male
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Birth</FormLabel>
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
                      disabled={(date) =>
                        date > new Date()
                      }
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
            name="breed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Breed</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select breed" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {breeds.map((breed) => (
                      <SelectItem key={breed} value={breed}>
                        {breed}
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
            name="weightAtBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight at Birth (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Enter weight in kg"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="origin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Origin</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select origin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="birth">Born on farm</SelectItem>
                    <SelectItem value="purchase">Purchased</SelectItem>
                    <SelectItem value="import">Imported</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="stateAtBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State at Birth</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Healthy, Weak, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="fatherId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Father's ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter father's tag number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="motherId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mother's ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter mother's tag number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color/Markings</FormLabel>
                <FormControl>
                  <Input placeholder="Describe color and markings" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter any additional information about this animal"
                  className="resize-none min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex items-center justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/animals')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-farm-green hover:bg-farm-green/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registering..." : "Register Animal"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
