
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, FileText, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EditHealthRecordDialog } from "./EditHealthRecordDialog";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
}

interface HealthRecordCardProps {
  record: HealthRecord;
  className?: string;
  onRecordChange?: () => void;
}

const recordTypeColors: Record<string, string> = {
  "Vaccination": "bg-green-100 text-green-800 border-green-200",
  "Treatment": "bg-blue-100 text-blue-800 border-blue-200",
  "Deworming": "bg-teal-100 text-teal-800 border-teal-200",
  "Illness": "bg-red-100 text-red-800 border-red-200",
  "Check-up": "bg-purple-100 text-purple-800 border-purple-200",
};

const statusColors: Record<string, string> = {
  "Completed": "bg-green-100 text-green-800 border-green-200",
  "Ongoing": "bg-amber-100 text-amber-800 border-amber-200",
  "Scheduled": "bg-blue-100 text-blue-800 border-blue-200",
  "Needs Follow-up": "bg-red-100 text-red-800 border-red-200",
};

export function HealthRecordCard({ record, className, onRecordChange }: HealthRecordCardProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [animals, setAnimals] = useState<Array<{ id: string; name: string; tag: string }>>([]);
  
  // Fetch animals for the edit dialog when it's opened
  const handleEditClick = async () => {
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
      
      setShowEditDialog(true);
    } catch (error) {
      console.error('Error fetching animals:', error);
      toast({
        title: "Error",
        description: "Failed to load animals. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('health_records')
        .delete()
        .eq('id', record.id);
      
      if (error) throw error;
      
      toast({
        title: "Health Record Deleted",
        description: `${record.recordType} record for ${record.animalName} has been removed`
      });
      
      if (onRecordChange) {
        onRecordChange();
      }
    } catch (error: any) {
      console.error('Error deleting health record:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete health record",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <Card className={cn("overflow-hidden hover:shadow-md transition-all", className)}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline"
                className={cn("text-xs", recordTypeColors[record.recordType])}
              >
                {record.recordType}
              </Badge>
              <Badge 
                variant="outline"
                className={cn("text-xs", statusColors[record.status])}
              >
                {record.status}
              </Badge>
            </div>
            <CardTitle className="mt-2 font-medium text-base">
              {record.animalName} (#{record.animalTag})
            </CardTitle>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">
              {format(record.date, "MMM dd, yyyy")}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(record.date, "h:mm a")}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <p className="text-sm mb-3">{record.description}</p>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <p className="text-muted-foreground">Administered by</p>
            <p className="font-medium">{record.administeredBy}</p>
          </div>
          
          {record.outcome && (
            <div>
              <p className="text-muted-foreground">Outcome</p>
              <p className="font-medium">{record.outcome}</p>
            </div>
          )}
          
          {record.followUp && (
            <div className="col-span-2">
              <p className="text-muted-foreground">Follow-up Date</p>
              <p className="font-medium">{format(record.followUp, "MMM dd, yyyy")}</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-3 bg-farm-neutral-light/50">
        <div className="flex gap-2 w-full">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1"
            onClick={() => setShowDetails(true)}
          >
            <FileText className="h-4 w-4 mr-1" />
            <span>View Details</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1"
            onClick={handleEditClick}
          >
            <Edit className="h-4 w-4 mr-1" />
            <span>Edit</span>
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-1" />
                <span>Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this health record for {record.animalName}.
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
        </div>
      </CardFooter>
      
      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Health Record Details</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-lg">{record.animalName}</h2>
                <p className="text-sm text-muted-foreground">Tag: #{record.animalTag}</p>
              </div>
              <div className="flex flex-col items-end">
                <Badge 
                  variant="outline"
                  className={cn("text-xs", recordTypeColors[record.recordType])}
                >
                  {record.recordType}
                </Badge>
                <p className="text-sm mt-1">{format(record.date, "PPP")}</p>
              </div>
            </div>
            
            <div className="border-t border-b py-3">
              <h3 className="font-medium mb-1">Description</h3>
              <p className="text-sm">{record.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm">Administered by</h3>
                <p className="text-sm">{record.administeredBy}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm">Status</h3>
                <Badge 
                  variant="outline"
                  className={cn("text-xs mt-1", statusColors[record.status])}
                >
                  {record.status}
                </Badge>
              </div>
              
              {record.outcome && (
                <div className="col-span-2">
                  <h3 className="font-medium text-sm">Outcome</h3>
                  <p className="text-sm">{record.outcome}</p>
                </div>
              )}
              
              {record.followUp && (
                <div className="col-span-2">
                  <h3 className="font-medium text-sm">Follow-up Date</h3>
                  <p className="text-sm">{format(record.followUp, "PPP")}</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Health Record Dialog */}
      <EditHealthRecordDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={onRecordChange}
        animals={animals}
        record={record}
      />
    </Card>
  );
}
