import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types/supabase";
import ProfileManager from "@/utils/profile-manager";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Eye, EyeOff, KeyRound } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Profile() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  
  // Load user data using ProfileManager
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      
      try {
        // Get user from ProfileManager - handles both Supabase and localStorage
        const userData = await ProfileManager.getCurrentUser();
        
        if (userData) {
          setUser(userData);
          setUsername(userData.username || '');
          setEmail(userData.email || '');
          setFullName(userData.full_name || '');
          setRole(userData.role || 'user');
        } else {
          console.error("No user data available");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      // Update the user profile using ProfileManager
      const updatedUser: User = {
        ...user,
        username,
        full_name: fullName,
      };
      
      const success = await ProfileManager.updateProfile(updatedUser);
      
      if (!success) {
        throw new Error("Failed to update profile");
      }
      
      // Update local user state
      setUser(updatedUser);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    
    // Validate passwords
    if (!currentPassword) {
      setPasswordError("Current password is required");
      return;
    }
    
    if (!newPassword) {
      setPasswordError("New password is required");
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords don't match");
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      // First verify the current password by signing in
      if (!email) {
        throw new Error("Email not found. Please refresh the page and try again.");
      }
      
      // First, verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      
      if (signInError) {
        throw new Error("Current password is incorrect");
      }
      
      // Then update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (updateError) {
        throw updateError;
      }
      
      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      
      setPasswordSuccess("Your password has been changed successfully");
      
      // Set a timeout to clear the success message after 5 seconds
      setTimeout(() => setPasswordSuccess(""), 5000);
      
    } catch (error: any) {
      console.error("Error changing password:", error);
      setPasswordError(error.message || "Failed to change password. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-farm-green border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Not Logged In</CardTitle>
            <CardDescription>Please log in to view your profile</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 gap-6">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Your Profile</CardTitle>
              <CardDescription>Manage your account details and preferences</CardDescription>
            </div>
            <Badge variant="outline" className="border-farm-green text-farm-green px-3 py-1">
              {user.role}
            </Badge>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
              </TabsList>
              
              <TabsContent value="account" className="space-y-6">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex flex-col items-center gap-3">
                    <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback className="text-3xl bg-farm-green text-white">
                        {username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" className="w-full">Change Avatar</Button>
                  </div>
                  
                  <div className="flex-1 space-y-4 w-full">
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input 
                            id="username" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            value={email} 
                            disabled 
                            className="bg-gray-50"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="full-name">Full Name</Label>
                          <Input 
                            id="full-name" 
                            value={fullName} 
                            onChange={(e) => setFullName(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Input 
                            id="role" 
                            value={role} 
                            disabled 
                            className="bg-gray-50"
                          />
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        disabled={isUpdating}
                        className="mt-4 w-full bg-farm-green hover:bg-farm-green/90 text-white">
                        {isUpdating ? (
                          <>
                            <span className="mr-2">Updating...</span>
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </>
                        ) : (
                          'Update Profile'
                        )}
                      </Button>
                    </form>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your password to keep your account secure</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {passwordSuccess && (
                      <Alert className="bg-green-50 border-green-200 mb-4">
                        <KeyRound className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-700">Success</AlertTitle>
                        <AlertDescription className="text-green-600">
                          {passwordSuccess}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {passwordError && (
                      <Alert className="bg-red-50 border-red-200 mb-4">
                        <KeyRound className="h-4 w-4 text-red-600" />
                        <AlertTitle className="text-red-700">Error</AlertTitle>
                        <AlertDescription className="text-red-600">
                          {passwordError}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <div className="relative">
                          <Input 
                            id="current-password" 
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter your current password"
                            className="pr-10"
                          />
                          <button 
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <div className="relative">
                          <Input 
                            id="new-password" 
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter your new password"
                            className="pr-10"
                          />
                          <button 
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input 
                          id="confirm-password" 
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Confirm your new password"
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        disabled={isChangingPassword}
                        className="w-full mt-4 bg-farm-green hover:bg-farm-green/90 text-white">
                        {isChangingPassword ? (
                          <>
                            <span className="mr-2">Changing Password...</span>
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </>
                        ) : (
                          'Change Password'
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="preferences" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Manage how you receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Notification preferences will be available in a future update.
                    </p>
                    <Button variant="outline">Coming Soon</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
