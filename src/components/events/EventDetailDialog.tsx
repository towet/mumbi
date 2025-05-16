import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Trash2, Calendar, Clock, Tag, Users } from "lucide-react";
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

type EventType = "Birth" | "Mating" | "Weaning" | "Shearing" | "Vaccination" | "Custom";

interface FarmEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  time?: string;
  description: string;
  animals: string[];
  status: "Upcoming" | "In Progress" | "Completed" | "Missed";
}

interface EventDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: FarmEvent | null;
  onSuccess?: () => void;
}

const eventTypeColors: Record<EventType, string> = {
  "Birth": "bg-rose-100 text-rose-800 border-rose-200",
  "Mating": "bg-purple-100 text-purple-800 border-purple-200",
  "Weaning": "bg-amber-100 text-amber-800 border-amber-200",
  "Shearing": "bg-blue-100 text-blue-800 border-blue-200",
  "Vaccination": "bg-green-100 text-green-800 border-green-200",
  "Custom": "bg-slate-100 text-slate-800 border-slate-200",
};

const statusColors: Record<string, string> = {
  "Upcoming": "bg-blue-100 text-blue-800 border-blue-200",
  "In Progress": "bg-amber-100 text-amber-800 border-amber-200",
  "Completed": "bg-green-100 text-green-800 border-green-200",
  "Missed": "bg-red-100 text-red-800 border-red-200",
};

export function EventDetailDialog({ open, onOpenChange, event, onSuccess }: EventDetailDialogProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  
  if (!event) return null;
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);
      
      if (error) throw error;
      
      toast({
        title: "Event Deleted",
        description: `${event.title} has been removed`
      });
      
      // Close the dialog and refresh the events list
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Format the date in a more readable format
  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center justify-between">
            <span>{event.title}</span>
            <div className="flex gap-2">
              <Badge 
                variant="outline"
                className={cn("text-xs", eventTypeColors[event.type])}
              >
                {event.type}
              </Badge>
              <Badge 
                variant="outline"
                className={cn("text-xs", statusColors[event.status])}
              >
                {event.status}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
              {event.time && (
                <>
                  <Clock className="h-4 w-4 ml-3" />
                  <span>{event.time}</span>
                </>
              )}
            </div>
            
            <div className="pt-3">
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">{event.description}</p>
            </div>
          </div>
          
          {event.animals.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Animals Involved
              </h3>
              <div className="flex flex-wrap gap-2">
                {event.animals.map((animal, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {animal}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Event
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this event. This action cannot be undone.
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
      </DialogContent>
    </Dialog>
  );
}
