import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimalForm, AnimalFormData } from "@/components/animals/AnimalForm";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, Plus, Filter, Heart, Activity, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Define the Animal type to match AnimalCardProps
type Animal = {
  id: string;
  name: string;
  tagNumber: string;
  breed: string;
  age: string;
  sex: 'Male' | 'Female';
  status: 'Active' | 'Sold' | 'Dead' | 'Culled' | 'Pregnant';
  weightKg: number;
  healthStatus: 'Healthy' | 'Sick' | 'Recovering' | 'Pregnant';
  imageUrl?: string;
};

// Empty array for production - no mock data
const animalData: Animal[] = [];

export default function Animals() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sexFilter, setSexFilter] = useState("all");
  const [healthFilter, setHealthFilter] = useState("all");
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAnimal, setEditingAnimal] = useState<(AnimalFormData & { id: string }) | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const { toast } = useToast();
  
  const fetchAnimals = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('animals')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        // Transform the data to match the Animal type
        const formattedData: Animal[] = data.map(animal => ({
          id: animal.id,
          name: animal.name,
          tagNumber: animal.tag_number,
          breed: animal.breed,
          age: animal.age || '',
          sex: animal.sex as 'Male' | 'Female',
          status: animal.status as 'Active' | 'Sold' | 'Dead' | 'Culled' | 'Pregnant',
          weightKg: animal.weight_kg || 0,
          healthStatus: animal.health_status as 'Healthy' | 'Sick' | 'Recovering' | 'Pregnant',
          imageUrl: animal.image_url || undefined
        }));
        
        setAnimals(formattedData);
      } catch (error: any) {
        console.error('Error fetching animals:', error);
        toast({
          title: "Error fetching animals",
          description: error.message,
          variant: "destructive"
        });
        // Fall back to mock data if fetch fails
        setAnimals(animalData);
      } finally {
        setLoading(false);
      }
  };
  
  useEffect(() => {
    fetchAnimals();
  }, []);
  
  // Apply filters
  const filteredAnimals = animals.filter((animal) => {
    // Search filter
    const matchesSearch = 
      animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.tagNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.breed.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === "all" || animal.status === statusFilter;
    
    // Sex filter
    const matchesSex = sexFilter === "all" || animal.sex === sexFilter;
    
    // Health filter
    const matchesHealth = healthFilter === "all" || animal.healthStatus === healthFilter;
    
    return matchesSearch && matchesStatus && matchesSex && matchesHealth;
  });
  
  return (
    <>
      <Helmet>
        <title>Animals | Mumbi Farm Management</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Animals</h1>
            <p className="text-muted-foreground">
              Manage your flock with detailed records
            </p>
            <div className="flex items-center gap-2">
              <Link to="/animals/register">
                <Button className="flex items-center gap-2 bg-farm-green hover:bg-farm-green/90">
                  <Plus className="h-4 w-4" />
                  <span>Register Animal</span>
                </Button>
              </Link>
            </div>

          </div>
          

        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, tag number, breed..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Filters:</span>
            </div>
            
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
                <SelectItem value="Dead">Dead</SelectItem>
                <SelectItem value="Culled">Culled</SelectItem>
                <SelectItem value="Pregnant">Pregnant</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={sexFilter}
              onValueChange={setSexFilter}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Sex" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={healthFilter}
              onValueChange={setHealthFilter}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Health" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Healthy">Healthy</SelectItem>
                <SelectItem value="Sick">Sick</SelectItem>
                <SelectItem value="Recovering">Recovering</SelectItem>
                <SelectItem value="Pregnant">Pregnant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green"></div>
          </div>
        ) : filteredAnimals.length > 0 ? (
          <div className="overflow-x-auto rounded-xl shadow-md bg-white">
            <div className="overflow-hidden">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-farm-green/10 to-farm-green/5">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-farm-green uppercase tracking-wider">Animal</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-farm-green uppercase tracking-wider">Details</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-farm-green uppercase tracking-wider">Weight</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-farm-green uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-farm-green uppercase tracking-wider">Health</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-farm-green uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAnimals.map((animal, index) => (
                    <tr 
                      key={animal.id} 
                      className={`group hover:bg-farm-neutral-light/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-farm-neutral-light/20'}`}
                    >
                      {/* Animal Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-farm-green/10 text-farm-green font-semibold group-hover:bg-farm-green/20 transition-colors">
                            {animal.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 group-hover:text-farm-green transition-colors">{animal.name}</div>
                            <div className="text-xs text-gray-500">
                              <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded-md">#{animal.tagNumber}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Details */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col text-sm">
                          <div className="flex gap-2">
                            <span className="text-gray-500 text-xs">Breed:</span>
                            <span className="font-medium">{animal.breed}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-gray-500 text-xs">Age:</span>
                            <span className="font-medium">{animal.age}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-gray-500 text-xs">Sex:</span>
                            <span className="font-medium">{animal.sex}</span>
                          </div>
                        </div>
                      </td>
                      
                      {/* Weight */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <span className="font-semibold">{animal.weightKg}</span>
                          <span className="text-gray-500 ml-1">kg</span>
                        </div>
                      </td>
                      
                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${animal.status === 'Active' ? 'bg-green-100 text-green-800' : animal.status === 'Culled' ? 'bg-amber-100 text-amber-800' : animal.status === 'Pregnant' ? 'bg-purple-100 text-purple-800' : animal.status === 'Sold' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                          {animal.status}
                        </span>
                      </td>
                      
                      {/* Health Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${animal.healthStatus === 'Healthy' ? 'bg-green-100 text-green-800' : animal.healthStatus === 'Recovering' ? 'bg-amber-100 text-amber-800' : animal.healthStatus === 'Pregnant' ? 'bg-purple-100 text-purple-800' : 'bg-red-100 text-red-800'}`}>
                          {animal.healthStatus}
                        </span>
                      </td>
                      
                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="text-farm-green hover:bg-farm-green/10 rounded-full w-8 h-8 p-0">
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-farm-green hover:bg-farm-green/10 rounded-full w-8 h-8 p-0">
                            <Activity className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-farm-green hover:bg-farm-green/10 rounded-full w-8 h-8 p-0"
                            onClick={() => {
                              // Transform animal data to match the form data structure
                              const animalFormData: AnimalFormData & { id: string } = {
                                id: animal.id,
                                name: animal.name,
                                tag_number: animal.tagNumber,
                                breed: animal.breed,
                                age: animal.age,
                                sex: animal.sex,
                                status: animal.status,
                                weight_kg: animal.weightKg,
                                health_status: animal.healthStatus,
                                image_url: animal.imageUrl
                              };
                              setEditingAnimal(animalFormData);
                              setShowEditForm(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-xl shadow-md">
            <div className="w-16 h-16 bg-farm-neutral-light rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-farm-neutral-dark/40" />
            </div>
            <p className="text-lg font-medium text-center mb-2">No animals found</p>
            <p className="text-muted-foreground text-center mb-4">Try changing your search criteria or filters</p>
            <Button 
              variant="outline" 
              className="border-farm-green text-farm-green hover:bg-farm-green/10"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setSexFilter("all");
                setHealthFilter("all");
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>

      {/* Edit Form Dialog */}
      {editingAnimal && (
        <AnimalForm
          open={showEditForm}
          onOpenChange={setShowEditForm}
          initialData={editingAnimal}
          mode="edit"
          onSuccess={() => {
            fetchAnimals();
            setShowEditForm(false);
            setEditingAnimal(null);
            toast({
              title: "Animal Updated",
              description: "Animal information has been updated successfully"
            });
          }}
        />
      )}
    </>
  );
}
