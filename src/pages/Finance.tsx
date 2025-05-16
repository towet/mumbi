
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialSummary } from "@/components/financial/FinancialSummary";
import { AddTransactionDialog } from "@/components/financial/AddTransactionDialog";
import { TransactionTable } from "@/components/financial/TransactionTable";
import { supabase } from "@/integrations/supabase/client";

export default function Finance() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <>
      <Helmet>
        <title>Finance | Mumbi Farm Management</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
          <p className="text-muted-foreground">
            Track income, expenses, and financial performance
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <FinancialSummary />
          </TabsContent>
          
          <TabsContent value="transactions" className="mt-6">
            <TransactionTable 
              onAddTransaction={() => setShowAddDialog(true)}
              onRefresh={() => setActiveTab("transactions")}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <AddTransactionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => setActiveTab("transactions")}
      />
    </>
  );
}
