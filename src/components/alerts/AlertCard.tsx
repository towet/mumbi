import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AlertCircle, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AlertCardProps {
  alert: Alert;
  onStatusChange?: () => void;
  onDelete?: () => void;
}

const typeColors: Record<string, string> = {
  "Task": "bg-blue-100 text-blue-800 border-blue-200",
  "Reminder": "bg-amber-100 text-amber-800 border-amber-200",
  "Warning": "bg-orange-100 text-orange-800 border-orange-200",
  "Emergency": "bg-red-100 text-red-800 border-red-200",
};

const priorityColors: Record<string, string> = {
  "Low": "bg-slate-100 text-slate-800 border-slate-200",
  "Medium": "bg-blue-100 text-blue-800 border-blue-200",
  "High": "bg-amber-100 text-amber-800 border-amber-200",
  "Urgent": "bg-red-100 text-red-800 border-red-200",
};

const statusColors: Record<string, string> = {
  "Pending": "bg-sky-100 text-sky-800 border-sky-200",
  "In Progress": "bg-purple-100 text-purple-800 border-purple-200",
  "Completed": "bg-green-100 text-green-800 border-green-200",
  "Cancelled": "bg-gray-100 text-gray-800 border-gray-200",
};

export function AlertCard({ alert, onStatusChange, onDelete }: AlertCardProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const isDueDate = new Date(alert.dueDate) < new Date() && 
                   (alert.status === "Pending" || alert.status === "In Progress");
  
  const updateStatus = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('alerts')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', alert.id);
      
      if (error) throw error;
      
      toast({
        title: "Status Updated",
        description: `Alert status changed to ${newStatus}`,
      });
      
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error: any) {
      console.error('Error updating alert status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', alert.id);
      
      if (error) throw error;
      
      toast({
        title: "Alert Deleted",
        description: "The alert has been successfully deleted",
      });
      
      if (onDelete) {
        onDelete();
      }
    } catch (error: any) {
      console.error('Error deleting alert:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete alert",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Card className={cn(
      "overflow-hidden transition-all",
      isDueDate && "border-red-300 bg-red-50/50",
      alert.status === "Completed" && "bg-green-50/30",
      alert.status === "Cancelled" && "bg-gray-50/30"
    )}>
      <CardContent className="p-5">
        <div className="flex flex-wrap gap-2 mb-3 items-start justify-between">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={cn("text-xs", typeColors[alert.type])}
            >
              {alert.type}
            </Badge>
            <Badge
              variant="outline"
              className={cn("text-xs", priorityColors[alert.priority])}
            >
              {alert.priority}
            </Badge>
            <Badge
              variant="outline"
              className={cn("text-xs", statusColors[alert.status])}
            >
              {alert.status}
            </Badge>
          </div>
          
          {isDueDate && (
            <Badge
              variant="destructive"
              className="text-xs flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              Overdue
            </Badge>
          )}
        </div>
        
        <h3 className="font-semibold text-lg mb-1">{alert.title}</h3>
        <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>
        
        <div className="flex flex-col space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>Due: {format(new Date(alert.dueDate), "PPP")}</span>
          </div>
          
          {alert.animalName && (
            <div className="flex items-center gap-1">
              <span>Related to: {alert.animalName} #{alert.animalTag}</span>
            </div>
          )}
          
          {alert.createdBy && (
            <div className="flex items-center gap-1">
              <span>Created by: {alert.createdBy}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/20 px-5 py-3 flex justify-between">
        <div>
          {alert.status !== "Completed" && alert.status !== "Cancelled" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update Status"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {alert.status !== "Pending" && (
                  <DropdownMenuItem onClick={() => updateStatus("Pending")}>
                    <Clock className="mr-2 h-4 w-4" />
                    <span>Mark as Pending</span>
                  </DropdownMenuItem>
                )}
                {alert.status !== "In Progress" && (
                  <DropdownMenuItem onClick={() => updateStatus("In Progress")}>
                    <span className="mr-2 h-4 w-4 flex items-center justify-center">
                      <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse" />
                    </span>
                    <span>Mark as In Progress</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => updateStatus("Completed")}>
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                  <span>Mark as Completed</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus("Cancelled")}>
                  <XCircle className="mr-2 h-4 w-4 text-gray-500" />
                  <span>Mark as Cancelled</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Alert</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this alert? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
