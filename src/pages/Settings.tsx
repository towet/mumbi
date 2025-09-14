
import { useState } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { Check, X, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  
  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully.",
    });
  };
  
  const generalForm = useForm({
    defaultValues: {
      farmName: "Mumbi Farm",
      ownerName: "John Doe",
      contactEmail: "john@mumbifarm.com",
      contactPhone: "+1 234 567 8901",
      address: "123 Farm Road, Rural County",
      currency: "USD",
      dateFormat: "MM/DD/YYYY",
      timeZone: "UTC+0",
    }
  });
  
  const notificationsForm = useForm({
    defaultValues: {
      emailNotifications: true,
      smsNotifications: false,
      healthReminders: true,
      breedingReminders: true,
      financialAlerts: true,
      systemUpdates: false,
    }
  });
  
  const userPermissions = [
    {
      id: 1,
      name: "Admin",
      permissions: ["Full Access", "User Management", "Settings"],
      active: true,
    },
    {
      id: 2,
      name: "Farm Manager",
      permissions: ["Animal Records", "Health Records", "Reports"],
      active: true,
    },
    {
      id: 3,
      name: "Veterinarian",
      permissions: ["Health Records", "Limited Animal Records"],
      active: false,
    },
    {
      id: 4,
      name: "Assistant",
      permissions: ["Read Only"],
      active: true,
    },
  ];
  
  const breedOptions = [
    "Dorper",
    "Merino",
    "Suffolk",
    "Hampshire",
    "Blackhead Persian",
    "Red Maasai",
    "Romney",
    "Corriedale",
    "Blackface",
    "Jacob"
  ];
  
  const [activeBreeds, setActiveBreeds] = useState(breedOptions.slice(0, 6));
  const [inactiveBreeds, setInactiveBreeds] = useState(breedOptions.slice(6));
  
  const healthCategories = [
    {
      category: "Vaccinations",
      items: ["Clostridial Diseases", "Pulpy Kidney", "Tetanus", "Pasteurella"]
    },
    {
      category: "Common Diseases",
      items: ["Foot Rot", "Mastitis", "Pneumonia", "Internal Parasites"]
    },
    {
      category: "Medications",
      items: ["Antibiotics", "Anti-inflammatories", "Dewormers", "Vitamins"]
    }
  ];
  
  const [newBreed, setNewBreed] = useState("");
  const [newHealthItem, setNewHealthItem] = useState("");
  const [newHealthCategory, setNewHealthCategory] = useState("");
  
  const handleAddBreed = () => {
    if (newBreed && !activeBreeds.includes(newBreed) && !inactiveBreeds.includes(newBreed)) {
      setActiveBreeds([...activeBreeds, newBreed]);
      setNewBreed("");
      toast({
        title: "Breed Added",
        description: `${newBreed} has been added to your list of breeds.`,
      });
    }
  };
  
  const handleToggleBreed = (breed, isActive) => {
    if (isActive) {
      setActiveBreeds(activeBreeds.filter(b => b !== breed));
      setInactiveBreeds([...inactiveBreeds, breed]);
    } else {
      setInactiveBreeds(inactiveBreeds.filter(b => b !== breed));
      setActiveBreeds([...activeBreeds, breed]);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Settings | Mumbi Farm Management</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your farm management system preferences
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="users">Users & Roles</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>
                  Configure basic information about your farm
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <Form {...generalForm}>
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={generalForm.control}
                      name="farmName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Farm Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                      
                    <FormField
                      control={generalForm.control}
                      name="ownerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Owner Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={generalForm.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={generalForm.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="col-span-1 md:col-span-2">
                      <FormField
                        control={generalForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Textarea rows={3} {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={generalForm.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">USD - US Dollar</SelectItem>
                              <SelectItem value="EUR">EUR - Euro</SelectItem>
                              <SelectItem value="GBP">GBP - British Pound</SelectItem>
                              <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                              <SelectItem value="ZAR">ZAR - South African Rand</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={generalForm.control}
                      name="dateFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date Format</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select date format" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={generalForm.control}
                      name="timeZone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time Zone</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time zone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="UTC+0">UTC+0 - London</SelectItem>
                              <SelectItem value="UTC+3">UTC+3 - Nairobi, Moscow</SelectItem>
                              <SelectItem value="UTC-5">UTC-5 - New York, Toronto</SelectItem>
                              <SelectItem value="UTC-8">UTC-8 - Los Angeles</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
              
              <CardFooter className="flex justify-end">
                <Button className="bg-farm-green hover:bg-farm-green/90" onClick={handleSaveSettings}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Roles</CardTitle>
                <CardDescription>
                  Manage user roles and permissions for farm users
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {userPermissions.map((role) => (
                    <div key={role.id} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{role.name}</h3>
                          <Badge variant={role.active ? "default" : "outline"} className="text-xs">
                            {role.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {role.permissions.map((permission, index) => (
                            <Badge key={index} variant="outline" className="text-xs font-normal">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button 
                          variant={role.active ? "destructive" : "default"} 
                          size="sm"
                        >
                          {role.active ? "Disable" : "Enable"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end">
                <Button className="bg-farm-green hover:bg-farm-green/90">
                  Add New Role
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Breed Categories</CardTitle>
                <CardDescription>
                  Manage the breeds available for your animals
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input 
                      placeholder="Add new breed" 
                      value={newBreed}
                      onChange={(e) => setNewBreed(e.target.value)}
                      className="flex-grow"
                    />
                    <Button 
                      onClick={handleAddBreed}
                      disabled={!newBreed}
                      className="whitespace-nowrap"
                    >
                      Add Breed
                    </Button>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Active Breeds</h4>
                    <div className="flex flex-wrap gap-2">
                      {activeBreeds.map((breed) => (
                        <Badge 
                          key={breed} 
                          variant="outline" 
                          className="flex items-center gap-1 cursor-pointer hover:bg-muted"
                          onClick={() => handleToggleBreed(breed, true)}
                        >
                          {breed}
                          <X className="h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {inactiveBreeds.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Inactive Breeds</h4>
                      <div className="flex flex-wrap gap-2">
                        {inactiveBreeds.map((breed) => (
                          <Badge 
                            key={breed} 
                            variant="outline" 
                            className="flex items-center gap-1 text-muted-foreground cursor-pointer hover:bg-muted"
                            onClick={() => handleToggleBreed(breed, false)}
                          >
                            {breed}
                            <Check className="h-3 w-3" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Health Categories</CardTitle>
                <CardDescription>
                  Manage health-related categories and items
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  {healthCategories.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <h4 className="font-medium">{category.category}</h4>
                      <div className="flex flex-wrap gap-2">
                        {category.items.map((item, i) => (
                          <Badge key={i} variant="outline">{item}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Add New Health Item</h4>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Select
                        value={newHealthCategory}
                        onValueChange={setNewHealthCategory}
                      >
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {healthCategories.map((cat, i) => (
                            <SelectItem key={i} value={cat.category}>{cat.category}</SelectItem>
                          ))}
                          <SelectItem value="new">+ New Category</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Input 
                        placeholder="New health item" 
                        value={newHealthItem}
                        onChange={(e) => setNewHealthItem(e.target.value)}
                        className="flex-grow"
                      />
                      
                      <Button className="whitespace-nowrap">
                        Add Item
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Form {...notificationsForm}>
                  <div className="space-y-4">
                    <FormField
                      control={notificationsForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <div className="flex justify-between items-center py-2">
                          <div>
                            <Label htmlFor="emailNotifications" className="font-medium">Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                          </div>
                          <Switch 
                            id="emailNotifications"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </div>
                      )}
                    />
                    
                    <FormField
                      control={notificationsForm.control}
                      name="smsNotifications"
                      render={({ field }) => (
                        <div className="flex justify-between items-center py-2">
                          <div>
                            <Label htmlFor="smsNotifications" className="font-medium">SMS Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                          </div>
                          <Switch 
                            id="smsNotifications"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </div>
                      )}
                    />
                    
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium mb-4">Notification Types</h4>
                      
                      <FormField
                        control={notificationsForm.control}
                        name="healthReminders"
                        render={({ field }) => (
                          <div className="flex justify-between items-center py-2">
                            <div>
                              <Label htmlFor="healthReminders" className="font-medium">Health Reminders</Label>
                              <p className="text-sm text-muted-foreground">Vaccinations, treatments, and check-ups</p>
                            </div>
                            <Switch 
                              id="healthReminders"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </div>
                        )}
                      />
                      
                      <FormField
                        control={notificationsForm.control}
                        name="breedingReminders"
                        render={({ field }) => (
                          <div className="flex justify-between items-center py-2">
                            <div>
                              <Label htmlFor="breedingReminders" className="font-medium">Breeding Reminders</Label>
                              <p className="text-sm text-muted-foreground">Mating, pregnancy, and birth events</p>
                            </div>
                            <Switch 
                              id="breedingReminders"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </div>
                        )}
                      />
                      
                      <FormField
                        control={notificationsForm.control}
                        name="financialAlerts"
                        render={({ field }) => (
                          <div className="flex justify-between items-center py-2">
                            <div>
                              <Label htmlFor="financialAlerts" className="font-medium">Financial Alerts</Label>
                              <p className="text-sm text-muted-foreground">Budget limits and financial reports</p>
                            </div>
                            <Switch 
                              id="financialAlerts"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </div>
                        )}
                      />
                      
                      <FormField
                        control={notificationsForm.control}
                        name="systemUpdates"
                        render={({ field }) => (
                          <div className="flex justify-between items-center py-2">
                            <div>
                              <Label htmlFor="systemUpdates" className="font-medium">System Updates</Label>
                              <p className="text-sm text-muted-foreground">New features and system maintenance</p>
                            </div>
                            <Switch 
                              id="systemUpdates"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </Form>
              </CardContent>
              
              <CardFooter className="flex justify-end">
                <Button className="bg-farm-green hover:bg-farm-green/90" onClick={handleSaveSettings}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
