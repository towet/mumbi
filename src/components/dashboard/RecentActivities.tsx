
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ActivityType = "health" | "event" | "transaction" | "system";

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
}

const recentActivities: Activity[] = [
  {
    id: "1",
    type: "health",
    title: "Vaccination Complete",
    description: "10 sheep vaccinated against bluetongue",
    timestamp: "Today, 10:30 AM"
  },
  {
    id: "2",
    type: "event",
    title: "Lambing Event",
    description: "Ewe #102 gave birth to twins",
    timestamp: "Today, 8:15 AM"
  },
  {
    id: "3",
    type: "transaction",
    title: "Wool Sale",
    description: "22 kg of wool sold for $980",
    timestamp: "Yesterday, 2:45 PM"
  },
  {
    id: "4",
    type: "system",
    title: "Inventory Alert",
    description: "Feed stock is running low (15% remaining)",
    timestamp: "Yesterday, 11:20 AM"
  },
  {
    id: "5",
    type: "health",
    title: "Veterinarian Visit",
    description: "Annual health check completed for breeding stock",
    timestamp: "Aug 8, 9:00 AM"
  },
  {
    id: "6",
    type: "event",
    title: "Weight Recording",
    description: "15 lambs weighed and recorded",
    timestamp: "Aug 7, 4:30 PM"
  }
];

const getActivityColor = (type: ActivityType): string => {
  switch (type) {
    case "health":
      return "bg-rose-100 text-rose-800";
    case "event":
      return "bg-blue-100 text-blue-800";
    case "transaction":
      return "bg-emerald-100 text-emerald-800";
    case "system":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function RecentActivities() {
  return (
    <Card className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
      <CardHeader>
        <CardTitle className="text-xl">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {recentActivities.map((activity, index) => (
            <div 
              key={activity.id}
              className="flex gap-4 animate-slide-in" 
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <div className="relative flex-shrink-0">
                <div className={cn(
                  "h-9 w-9 rounded-full flex items-center justify-center",
                  getActivityColor(activity.type)
                )}>
                  <span className="text-xs font-medium">
                    {activity.type.charAt(0).toUpperCase()}
                  </span>
                </div>
                {index < recentActivities.length - 1 && (
                  <div className="absolute top-10 bottom-0 left-1/2 w-0.5 -translate-x-1/2 bg-border h-10" />
                )}
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{activity.title}</h4>
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs font-normal", getActivityColor(activity.type))}
                  >
                    {activity.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
