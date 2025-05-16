
import { useState } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { EventsList } from "@/components/events/EventsList";
import { AddEventDialog } from "@/components/events/AddEventDialog";
import { Plus } from "lucide-react";

export default function Events() {
  const [showAddDialog, setShowAddDialog] = useState(false);

  return (
    <>
      <Helmet>
        <title>Events | Mumbi Farm Management</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Events</h1>
            <p className="text-muted-foreground">
              Track births, matings, shearings and other farm activities
            </p>
          </div>
          
          <Button 
            className="flex items-center gap-2 bg-farm-green hover:bg-farm-green/90"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Add Event</span>
          </Button>
        </div>
        
        <EventsList />
      </div>
      
      <AddEventDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </>
  );
}
