export interface Alert {
  id: string;
  title: string;
  description: string;
  type: "Task" | "Reminder" | "Warning" | "Emergency";
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  dueDate: string;
  animalId?: string;
  animalName?: string;
  animalTag?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}
