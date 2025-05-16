import { useState } from "react";
import { Helmet } from "react-helmet";
import { AlertsList } from "@/components/alerts/AlertsList";
import { AddAlertDialog } from "@/components/alerts/AddAlertDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Alerts() {
  const [showAddDialog, setShowAddDialog] = useState(false);

  return (
    <>
      <Helmet>
        <title>Alerts | Mumbi Farm Management</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Alerts & Tasks</h1>
            <p className="text-muted-foreground">
              Manage farm tasks, reminders, and urgent alerts
            </p>
          </div>
          
          <Button 
            className="flex items-center gap-2 bg-farm-green hover:bg-farm-green/90"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Add Alert</span>
          </Button>
        </div>
        
        <AlertsList onAddAlert={() => setShowAddDialog(true)} />
      </div>
      
      <AddAlertDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </>
  );
}
