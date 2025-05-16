
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HealthRecordCard } from "@/components/health/HealthRecordCard";
import { AddHealthRecordDialog } from "@/components/health/AddHealthRecordDialog";
import { Filter, Plus, Search } from "lucide-react";
import { format } from "date-fns";

// Empty array for production - no mock data
const healthRecordsData: any[] = [];

export default function Health() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [healthRecords, setHealthRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [animals, setAnimals] = useState<any[]>([]);

  useEffect(() => {
    fetchHealthRecords();
    fetchAnimals();
  }, []);

  async function fetchAnimals() {
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
    } catch (error) {
      console.error('Error fetching animals:', error);
    }
  }

  async function fetchHealthRecords() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('health_records')
        .select('*, animals(id, name, tag_number)');
      
      if (error) throw error;
      
      // Transform the data to match the expected format
      const formattedRecords = data.map(record => ({
        id: record.id,
        animalId: record.animal_id,
        animalName: record.animals?.name || 'Unknown',
        animalTag: record.animals?.tag_number || 'Unknown',
        recordType: record.record_type as any,
        date: new Date(record.date),
        description: record.description,
        administeredBy: record.administered_by || 'Unknown',
        outcome: record.outcome || undefined,
        followUp: record.follow_up ? new Date(record.follow_up) : undefined,
        status: record.status as any,
        notes: record.notes
      }));
      
      setHealthRecords(formattedRecords);
    } catch (error) {
      console.error('Error fetching health records:', error);
      // Fallback to mock data if fetch fails
      setHealthRecords(healthRecordsData);
    } finally {
      setLoading(false);
    }
  }
  
  // Apply filters
  const filteredRecords = healthRecords.filter((record) => {
    // Search filter
    const matchesSearch = 
      record.animalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.animalTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Type filter
    const matchesType = typeFilter === "all" || record.recordType === typeFilter;
    
    // Status filter
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });
  
  return (
    <>
      <Helmet>
        <title>Health Records | Mumbi Farm Management</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Health Records</h1>
            <p className="text-muted-foreground">
              Track vaccinations, treatments, and medical history
            </p>
          </div>
          
          <Button 
            className="flex items-center gap-2 bg-farm-green hover:bg-farm-green/90"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Add Record</span>
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search health records..."
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
              value={typeFilter}
              onValueChange={setTypeFilter}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Record Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Vaccination">Vaccination</SelectItem>
                <SelectItem value="Treatment">Treatment</SelectItem>
                <SelectItem value="Deworming">Deworming</SelectItem>
                <SelectItem value="Illness">Illness</SelectItem>
                <SelectItem value="Check-up">Check-up</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Ongoing">Ongoing</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Needs Follow-up">Needs Follow-up</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading health records...</p>
          </div>
        ) : filteredRecords.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecords.map((record) => (
              <HealthRecordCard
                key={record.id}
                record={record}
                onRecordChange={fetchHealthRecords}
                className="animate-fade-in"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No health records found matching your filters.</p>
            <Button 
              variant="link" 
              onClick={() => {
                setSearchQuery("");
                setTypeFilter("all");
                setStatusFilter("all");
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
      
      <AddHealthRecordDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
        onSuccess={fetchHealthRecords}
        animals={animals}
      />
    </>
  );
}
