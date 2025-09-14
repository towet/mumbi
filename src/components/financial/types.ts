export interface Transaction {
  id: string;
  type: "Income" | "Expense";
  category: string;
  amount: number;
  date: string;
  description: string;
  relatedTo: "Animal" | "Farm" | "Other";
  paymentMethod: string;
  reference?: string;
  animalId?: string;
  animalName?: string;
  animalTag?: string;
}
