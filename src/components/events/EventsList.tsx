
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, List, Search, Plus } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AddEventDialog } from "@/components/events/AddEventDialog";
import { EventDetailDialog } from "@/components/events/EventDetailDialog";

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

const dummyEvents: FarmEvent[] = [
  {
    id: "1",
    title: "Sheep Shearing Day",
    type: "Shearing",
    date: "2023-08-15",
    time: "08:00 AM",
    description: "Annual shearing for the entire flock",
    animals: ["Group: Adult Ewes", "Group: Adult Rams"],
    status: "Upcoming"
  },
  {
    id: "2",
    title: "Lamb Vaccination",
    type: "Vaccination",
    date: "2023-08-12",
    time: "09:30 AM",
    description: "First round of vaccinations for spring lambs",
    animals: ["Group: Spring Lambs"],
    status: "Upcoming"
  },
  {
    id: "3",
    title: "Ewe 102 Lambing",
    type: "Birth",
    date: "2023-08-05",
    time: "06:15 AM",
    description: "Ewe #102 gave birth to twins",
    animals: ["Ewe #102", "Lamb #225", "Lamb #226"],
    status: "Completed"
  },
  {
    id: "4",
    title: "Breeding Season Start",
    type: "Mating",
    date: "2023-09-01",
    description: "Begin pairing selected rams with breeding ewes",
    animals: ["Group: Breeding Ewes", "Ram #42", "Ram #56"],
    status: "Upcoming"
  },
  {
    id: "5",
    title: "Weaning Group 3",
    type: "Weaning",
    date: "2023-08-20",
    description: "Separate lambs from Group 3 from mothers",
    animals: ["Group: Spring Lambs Group 3"],
    status: "Upcoming"
  }
];

export function EventsList() {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [events, setEvents] = useState<FarmEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [selectedEvent, setSelectedEvent] = useState<FarmEvent | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  
  useEffect(() => {
    fetchEvents();
  }, []);
  
  async function fetchEvents() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*, animals(id, name, tag_number)');
      
      if (error) throw error;
      
      // Transform the data to match the expected format
      const formattedEvents = data.map(event => {
        // Format the animals array - either from related animal or from notes
        let animalsList: string[] = [];
        if (event.animal_id) {
          // If it's linked to an animal in the database
          const animalName = event.animals?.name || 'Unknown';
          const animalTag = event.animals?.tag_number || 'Unknown';
          animalsList.push(`${animalName} (#${animalTag})`);
        } else if (event.notes) {
          // Sometimes notes might contain json with animal groups or other info
          try {
            const notesData = JSON.parse(event.notes);
            if (Array.isArray(notesData.animals)) {
              animalsList = notesData.animals;
            }
          } catch {
            // If notes is not parseable JSON with animals, leave array empty
          }
        }
        
        return {
          id: event.id,
          title: event.description, // Using description as title since that's what we have in the schema
          type: event.event_type as EventType,
          date: event.date,
          time: event.notes?.includes('time:') ? event.notes.split('time:')[1]?.trim().split(' ')[0] : undefined,
          description: event.description,
          animals: animalsList,
          status: event.notes?.includes('status:') ? 
            (event.notes.split('status:')[1]?.trim().split(' ')[0] as "Upcoming" | "In Progress" | "Completed" | "Missed") : 
            "Upcoming"
        };
      });
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      // Fallback to dummy data if fetch fails
      setEvents(dummyEvents);
    } finally {
      setLoading(false);
    }
  }
  
  const filteredEvents = events
    .filter(event => 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.type.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(event => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'upcoming') return event.status === 'Upcoming' || event.status === 'In Progress';
      if (statusFilter === 'completed') return event.status === 'Completed';
      return true;
    });
  
  return (
    <>
      <Card className="animate-fade-in">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">Farm Events</CardTitle>
              <CardDescription>Manage and track all farm activities</CardDescription>
            </div>
            <Button 
              className="bg-farm-green hover:bg-farm-green/90"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="mr-1 h-4 w-4" /> Add Event
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search events..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Tabs 
              defaultValue="all" 
              className="w-[300px]" 
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as 'all' | 'upcoming' | 'completed')}
            >
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex gap-1 border rounded-md">
              <Button
                variant={view === "list" ? "default" : "ghost"}
                className={view === "list" ? "bg-farm-green hover:bg-farm-green/90" : ""}
                size="icon"
                onClick={() => setView("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={view === "calendar" ? "default" : "ghost"}
                className={view === "calendar" ? "bg-farm-green hover:bg-farm-green/90" : ""}
                size="icon"
                onClick={() => setView("calendar")}
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {view === "list" ? (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading events...</p>
                </div>
              ) : filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="sm:w-32 flex flex-col">
                      <span className="text-sm font-medium">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {event.time && (
                        <span className="text-xs text-muted-foreground">
                          {event.time}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-medium">{event.title}</h4>
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
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {event.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1">
                        {event.animals.map((animal, index) => (
                          <Badge key={index} variant="secondary" className="text-xs font-normal">
                            {animal}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="sm:w-24 flex items-center justify-end sm:justify-center mt-2 sm:mt-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowDetailDialog(true);
                        }}
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No events found matching your search.
                </div>
              )}
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center border rounded-lg">
              <p className="text-muted-foreground">Calendar view will be implemented here.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AddEventDialog 
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={fetchEvents}
      />
      
      <EventDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        event={selectedEvent}
        onSuccess={fetchEvents}
      />
    </>
  );
}
