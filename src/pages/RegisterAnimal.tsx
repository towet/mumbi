import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ChevronLeft, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function RegisterAnimal() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [tagNumber, setTagNumber] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("Female");
  const [status, setStatus] = useState("Active");
  const [weight, setWeight] = useState<number | undefined>();
  const [healthStatus, setHealthStatus] = useState("Healthy");
  const [notes, setNotes] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !tagNumber || !breed || !sex || !status || !healthStatus) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('animals')
        .insert({
          name,
          tag_number: tagNumber,
          breed,
          age,
          sex,
          status,
          weight_kg: weight || null,
          health_status: healthStatus,
          notes: notes || null
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `${name} has been registered successfully`
      });
      
      // Navigate back to the animals list
      navigate("/animals");
    } catch (error: any) {
      console.error('Error registering animal:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to register animal",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Register Animal | Mumbi Farm Management</title>
      </Helmet>
      
      <div className="container py-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="gap-1 mb-4 hover:bg-farm-neutral-light"
            onClick={() => navigate("/animals")}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Animals
          </Button>
          
          <h1 className="text-2xl font-bold">Register New Animal</h1>
          <p className="text-muted-foreground">
            Add a new animal to your records
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information Section */}
            <div className="space-y-4 md:col-span-2">
              <h2 className="text-xl font-medium">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="name"
                    placeholder="Enter animal name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="tagNumber" className="text-sm font-medium">
                    Tag Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="tagNumber"
                    placeholder="Enter tag number"
                    value={tagNumber}
                    onChange={(e) => setTagNumber(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="breed" className="text-sm font-medium">
                    Breed <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="breed"
                    placeholder="Enter breed"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="age" className="text-sm font-medium">
                    Age
                  </label>
                  <Input
                    id="age"
                    placeholder="e.g., 2 years"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            {/* Additional Details Section */}
            <div className="space-y-4 md:col-span-2">
              <h2 className="text-xl font-medium">Additional Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="sex" className="text-sm font-medium">
                    Sex <span className="text-red-500">*</span>
                  </label>
                  <Select value={sex} onValueChange={setSex}>
                    <SelectTrigger id="sex">
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Male">Male</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Sold">Sold</SelectItem>
                      <SelectItem value="Dead">Dead</SelectItem>
                      <SelectItem value="Culled">Culled</SelectItem>
                      <SelectItem value="Pregnant">Pregnant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="weight" className="text-sm font-medium">
                    Weight (kg)
                  </label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="Enter weight in kg"
                    value={weight === undefined ? "" : weight}
                    onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="healthStatus" className="text-sm font-medium">
                    Health Status <span className="text-red-500">*</span>
                  </label>
                  <Select value={healthStatus} onValueChange={setHealthStatus}>
                    <SelectTrigger id="healthStatus">
                      <SelectValue placeholder="Select health status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Healthy">Healthy</SelectItem>
                      <SelectItem value="Sick">Sick</SelectItem>
                      <SelectItem value="Recovering">Recovering</SelectItem>
                      <SelectItem value="Pregnant">Pregnant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Notes
              </label>
              <Textarea
                id="notes"
                placeholder="Any additional information about this animal"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/animals")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-farm-green hover:bg-farm-green/90"
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : "Register Animal"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
