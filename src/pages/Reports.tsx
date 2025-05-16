
import { useState } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Printer, FileSpreadsheet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GenerateReportDialog } from "@/components/reports/GenerateReportDialog";

const reportCategories = [
  {
    title: "Inventory Reports",
    reports: [
      { id: "1", name: "Current Flock Summary", description: "Complete inventory of all animals" },
      { id: "2", name: "Breeding Stock Report", description: "List of all active breeding animals" },
      { id: "3", name: "Age Distribution", description: "Analysis of flock by age groups" },
    ]
  },
  {
    title: "Health Reports",
    reports: [
      { id: "4", name: "Vaccination Status", description: "Vaccination records and upcoming schedules" },
      { id: "5", name: "Health Incidents", description: "Summary of illnesses and treatments" },
      { id: "6", name: "Mortality Report", description: "Analysis of animal losses and causes" },
    ]
  },
  {
    title: "Breeding Reports",
    reports: [
      { id: "7", name: "Breeding Performance", description: "Success rates and outcomes" },
      { id: "8", name: "Lambing Statistics", description: "Details on lambing rates and survival" },
      { id: "9", name: "Genetic Analysis", description: "Bloodline tracking and trait inheritance" },
    ]
  },
  {
    title: "Financial Reports",
    reports: [
      { id: "10", name: "Revenue Summary", description: "Income from all farm activities" },
      { id: "11", name: "Expense Analysis", description: "Breakdown of all farm expenses" },
      { id: "12", name: "Profitability Report", description: "Analysis of farm profitability" },
    ]
  },
];

export default function Reports() {
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const handleGenerateClick = (reportId: string) => {
    setSelectedReportId(reportId);
    setShowGenerateDialog(true);
  };

  return (
    <>
      <Helmet>
        <title>Reports | Mumbi Farm Management</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">
              Generate and access detailed farm reports
            </p>
          </div>
          
          <Button 
            className="flex items-center gap-2 bg-farm-green hover:bg-farm-green/90"
            onClick={() => setShowGenerateDialog(true)}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Generate New Report</span>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {reportCategories.map((category, index) => (
            <Card key={category.title} className="animate-fade-in" style={{ animationDelay: `${0.1 * index}s` }}>
              <CardHeader>
                <CardTitle>{category.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {category.reports.map((report) => (
                    <div 
                      key={report.id} 
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-start gap-3 mb-3 sm:mb-0">
                        <div className="p-2 bg-farm-green/10 rounded-md">
                          <FileText className="h-5 w-5 text-farm-green" />
                        </div>
                        <div>
                          <h4 className="font-medium">{report.name}</h4>
                          <p className="text-sm text-muted-foreground">{report.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                          <Printer className="h-4 w-4 mr-1" />
                          Print
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1 sm:flex-none bg-farm-green hover:bg-farm-green/90"
                          onClick={() => handleGenerateClick(report.id)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <GenerateReportDialog 
        open={showGenerateDialog} 
        onOpenChange={setShowGenerateDialog} 
      />
    </>
  );
}
