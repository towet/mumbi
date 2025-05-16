
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Download, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface GenerateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  reportType: z.string().min(1, { message: "Report type is required" }),
  reportFormat: z.enum(["PDF", "Excel"]),
  dateRange: z.enum(["Last7Days", "Last30Days", "Last3Months", "Last6Months", "Last12Months", "Custom"]),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function GenerateReportDialog({ open, onOpenChange }: GenerateReportDialogProps) {
  const { toast } = useToast();
  
  const reportCategories = [
    {
      name: "Inventory Reports",
      reports: [
        { id: "inventory-flock", name: "Current Flock Summary" },
        { id: "inventory-breeding", name: "Breeding Stock Report" },
        { id: "inventory-age", name: "Age Distribution" },
      ]
    },
    {
      name: "Health Reports",
      reports: [
        { id: "health-vaccination", name: "Vaccination Status" },
        { id: "health-incidents", name: "Health Incidents" },
        { id: "health-mortality", name: "Mortality Report" },
      ]
    },
    {
      name: "Breeding Reports",
      reports: [
        { id: "breeding-performance", name: "Breeding Performance" },
        { id: "breeding-lambing", name: "Lambing Statistics" },
        { id: "breeding-genetic", name: "Genetic Analysis" },
      ]
    },
    {
      name: "Financial Reports",
      reports: [
        { id: "financial-revenue", name: "Revenue Summary" },
        { id: "financial-expense", name: "Expense Analysis" },
        { id: "financial-profit", name: "Profitability Report" },
      ]
    },
  ];

  // Flatten report options for the select component
  const reportOptions = reportCategories.flatMap(category => 
    category.reports.map(report => ({
      id: report.id,
      name: `${report.name} (${category.name.replace(" Reports", "")})`,
    }))
  );
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reportType: "",
      reportFormat: "PDF",
      dateRange: "Last30Days",
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log("Report generation submitted:", data);
    
    const reportName = reportOptions.find(r => r.id === data.reportType)?.name.split(" (")[0];
    
    toast({
      title: "Report Generated",
      description: `${reportName} report has been generated in ${data.reportFormat} format.`,
    });
    form.reset();
    onOpenChange(false);
  };

  const watchDateRange = form.watch("dateRange");
  const showCustomDateRange = watchDateRange === "Custom";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Generate Report</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <FormField
                  control={form.control}
                  name="reportType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Report Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select report type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px]">
                          {reportCategories.map((category) => (
                            <div key={category.name}>
                              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                {category.name}
                              </div>
                              {category.reports.map((report) => (
                                <SelectItem key={report.id} value={report.id}>
                                  {report.name}
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="reportFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Format</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PDF">PDF Document</SelectItem>
                        <SelectItem value="Excel">Excel Spreadsheet</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Range</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select date range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Last7Days">Last 7 Days</SelectItem>
                        <SelectItem value="Last30Days">Last 30 Days</SelectItem>
                        <SelectItem value="Last3Months">Last 3 Months</SelectItem>
                        <SelectItem value="Last6Months">Last 6 Months</SelectItem>
                        <SelectItem value="Last12Months">Last 12 Months</SelectItem>
                        <SelectItem value="Custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {showCustomDateRange && (
                <>
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date()}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => 
                                date > new Date() || 
                                (form.getValues("startDate") && date < form.getValues("startDate"))
                              }
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>

            <div className="flex items-center justify-center py-4">
              <div className="flex flex-col items-center text-center border border-dashed p-6 rounded-lg w-full">
                <FileText className="h-12 w-12 text-farm-green mb-2" />
                <h3 className="text-lg font-medium">Preview Not Available</h3>
                <p className="text-sm text-muted-foreground">
                  Report will be generated in your selected format when you click "Generate Report"
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" className="bg-farm-green hover:bg-farm-green/90">
                <Download className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
