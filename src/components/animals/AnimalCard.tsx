
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Edit, Heart, Activity, Trash2, AlertTriangle } from "lucide-react";
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
import { AnimalForm, AnimalFormData } from "./AnimalForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AnimalCardProps {
  animal: {
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
  className?: string;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Sold':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Dead':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Culled':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'Healthy':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Sick':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Recovering':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'Pregnant':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function AnimalCard({ animal, className, onAnimalChange }: AnimalCardProps & { onAnimalChange?: () => void }) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  
  const handleEdit = () => {
    setShowEditForm(true);
  };
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('animals')
        .delete()
        .eq('id', animal.id);
      
      if (error) throw error;
      
      toast({
        title: "Animal Deleted",
        description: `${animal.name} has been removed successfully`
      });
      
      if (onAnimalChange) {
        onAnimalChange();
      }
    } catch (error: any) {
      console.error('Error deleting animal:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete animal",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
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
  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-lg group relative border border-transparent hover:border-farm-green/40", className)}>
      {/* Status indicator - top right floating badge */}
      <div className="absolute -top-2 -right-2 z-10 transition-transform group-hover:scale-110">
        <Badge
          className={cn(
            "shadow-md border-2 border-white",
            getStatusColor(animal.status)
          )}
        >
          {animal.status}
        </Badge>
      </div>
      
      <CardHeader className="pb-2 pt-6">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <h3 className="text-xl font-bold bg-gradient-to-r from-farm-green to-emerald-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              {animal.name}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-farm-neutral-medium rounded-md px-2 py-0.5 font-mono">#{animal.tagNumber}</span>
              <Badge variant="outline" className="text-xs border-farm-green/40">
                {animal.sex}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-farm-neutral-light/50 p-3 rounded-lg transition-all hover:bg-farm-neutral-light group-hover:shadow-sm">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Breed</p>
            <p className="font-semibold text-farm-neutral-dark">{animal.breed}</p>
          </div>
          <div className="bg-farm-neutral-light/50 p-3 rounded-lg transition-all hover:bg-farm-neutral-light group-hover:shadow-sm">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Age</p>
            <p className="font-semibold text-farm-neutral-dark">{animal.age}</p>
          </div>
          <div className="bg-farm-neutral-light/50 p-3 rounded-lg transition-all hover:bg-farm-neutral-light group-hover:shadow-sm">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Weight</p>
            <p className="font-semibold text-farm-neutral-dark">{animal.weightKg} kg</p>
          </div>
          <div className="bg-farm-neutral-light/50 p-3 rounded-lg transition-all hover:bg-farm-neutral-light group-hover:shadow-sm">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Health</p>
            <Badge
              variant="outline"
              className={cn("mt-1 transition-all group-hover:scale-105", getStatusColor(animal.healthStatus))}
            >
              {animal.healthStatus}
            </Badge>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2 border-t pt-4 bg-gradient-to-r from-farm-neutral-light/30 to-farm-neutral-light/10">
        <Button variant="ghost" size="sm" className="flex-1 hover:bg-farm-green/10 hover:text-farm-green transition-colors">
          <Heart className="h-4 w-4 mr-1" />
          Health
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 hover:bg-farm-green/10 hover:text-farm-green transition-colors">
          <Activity className="h-4 w-4 mr-1" />
          Events
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 hover:bg-farm-green/10 hover:text-farm-green transition-colors" onClick={handleEdit}>
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </CardFooter>
      
      {/* Edit Form Dialog */}
      <AnimalForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        initialData={animalFormData}
        mode="edit"
        onSuccess={() => {
          if (onAnimalChange) {
            onAnimalChange();
          }
        }}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute top-3 left-3 bg-white/80 hover:bg-white z-10"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {animal.name} (#{animal.tagNumber}) from your records.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
