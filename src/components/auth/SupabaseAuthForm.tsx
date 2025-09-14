import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface SupabaseAuthFormProps {
  onAuthSuccess: () => void;
}

export function SupabaseAuthForm({ onAuthSuccess }: SupabaseAuthFormProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  
  // Form fields
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  
  // Form validation errors
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  
  const validateLogin = () => {
    setLoginError("");
    if (!loginUsername) return "Username is required";
    if (!loginPassword) return "Password is required";
    return "";
  };
  
  const validateSignup = () => {
    setSignupError("");
    if (!signupUsername) return "Username is required";
    if (!signupEmail) return "Email is required";
    if (!signupEmail.includes('@')) return "Please enter a valid email";
    if (!signupPassword) return "Password is required";
    if (signupPassword.length < 6) return "Password must be at least 6 characters";
    if (signupPassword !== signupConfirmPassword) return "Passwords don't match";
    return "";
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateLogin();
    if (error) {
      setLoginError(error);
      return;
    }
    
    setIsLoggingIn(true);
    
    try {
      // Query the profiles table to find the email associated with the username
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', loginUsername)
        .single();
      
      if (profileError) throw new Error("Username not found. Please check your username or sign up.");
      
      // Sign in with the found email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: profileData.email,
        password: loginPassword,
      });
      
      if (error) throw error;
      
      // Save user data in localStorage
      if (data.user) {
        const userData = {
          id: data.user.id,
          email: data.user.email,
          username: data.user.email.split('@')[0],
          role: 'user',
          isAuthenticated: true
        };
        
        localStorage.setItem('mumbi_user', JSON.stringify(userData));
      }
      
      toast({
        title: "Login successful",
        description: "Welcome back to Mumbi Farm Management"
      });
      
      onAuthSuccess();
    } catch (err: any) {
      console.error("Login error:", err);
      
      setLoginError(err.message || "Login failed. Please check your credentials.");
      
      toast({
        title: "Login failed",
        description: err.message || "Please check your credentials and try again",
        variant: "destructive"
      });
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateSignup();
    if (error) {
      setSignupError(error);
      return;
    }
    
    setIsSigningUp(true);
    
    try {
      // Check Supabase connection and prepare for signup
      const connectionCheck = await supabase.from('profiles').select('count').limit(1);
      console.log("Connection check result:", connectionCheck);
      
      // Register with Supabase with user metadata that will be used by our trigger
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            username: signupUsername,
            full_name: '', // Can be updated later in profile
            role: 'user' // Default role
          }
        }
      });
      
      if (error) throw error;
      
      if (data?.user) {
        // Save user in localStorage for immediate access
        const userData = {
          id: data.user.id,
          email: data.user.email,
          username: signupUsername,
          role: 'user',
          isAuthenticated: true
        };
        
        localStorage.setItem('mumbi_user', JSON.stringify(userData));
        
        // Ensure profile exists - our trigger should create it, but this is a backup
        // Wait a moment to allow the trigger to work first
        setTimeout(async () => {
          try {
            // First check if profile already exists
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user?.id || '')
              .maybeSingle();
              
            if (!existingProfile) {
              // Only create if it doesn't exist
              await supabase.from('profiles').insert({
                id: data.user?.id,
                username: signupUsername,
                email: signupEmail,
                role: 'user',
                created_at: new Date().toISOString()
              }).select();
              console.log("Backup profile creation successful");
            } else {
              console.log("Profile already exists, no need to create");
            }
          } catch (profileError) {
            console.error("Profile creation error:", profileError);
            // Continue even if profile creation fails, our app has localStorage backup
          }
        }, 1000); // Wait 1 second to allow trigger to complete
      }
      
      toast({
        title: "Account created successfully",
        description: "Welcome to Mumbi Farm Management"
      });
      
      onAuthSuccess();
    } catch (err: any) {
      console.error("Signup error:", err);
      
      setSignupError(err.message || "An error occurred during registration");
      
      toast({
        title: "Signup failed",
        description: err.message || "An error occurred during registration",
        variant: "destructive"
      });
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <img src="/Mumbi Farm Logo-01.png" alt="Mumbi Farm Logo" className="h-32 object-contain" />
        </div>
        
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            {/* Title and description removed as requested */}
          </CardHeader>
          
          <Tabs
            defaultValue="login"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "login" | "signup")}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full mb-4 rounded-md p-1">
              <TabsTrigger 
                value="login"
                className="rounded-md data-[state=active]:bg-farm-green data-[state=active]:text-white transition-all"
              >
                Login
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="rounded-md data-[state=active]:bg-farm-green data-[state=active]:text-white transition-all"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <CardContent className="px-5 pt-0 pb-5">
              <AnimatePresence mode="sync">
                <TabsContent value="login" key="login">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="username"
                            type="text"
                            placeholder="johndoe"
                            className="pl-10"
                            value={loginUsername}
                            onChange={(e) => setLoginUsername(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      {loginError && (
                        <p className="text-sm text-red-500">{loginError}</p>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-farm-green to-emerald-600 hover:opacity-90 transition-opacity"
                        disabled={isLoggingIn}
                      >
                        {isLoggingIn ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            Sign in
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                      
                      <div className="mt-4 text-center">
                        <Button 
                          type="button"
                          variant="link" 
                          onClick={() => setActiveTab("signup")}
                          className="text-farm-green hover:text-emerald-600 underline-offset-4"
                        >
                          Don't have an account? Sign up
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                </TabsContent>
                
                <TabsContent value="signup" key="signup">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="username"
                            placeholder="johndoe"
                            className="pl-10"
                            value={signupUsername}
                            onChange={(e) => setSignupUsername(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="your.email@example.com"
                            className="pl-10"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="confirm-password"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            value={signupConfirmPassword}
                            onChange={(e) => setSignupConfirmPassword(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      {signupError && (
                        <p className="text-sm text-red-500">{signupError}</p>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-farm-green to-emerald-600 hover:opacity-90 transition-opacity"
                        disabled={isSigningUp}
                      >
                        {isSigningUp ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          <>
                            Create account
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                      
                      <div className="mt-4 text-center">
                        <Button 
                          type="button"
                          variant="link" 
                          onClick={() => setActiveTab("login")}
                          className="text-farm-green hover:text-emerald-600 underline-offset-4"
                        >
                          Already have an account? Sign in
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
              
              <div className="mt-6 pt-6 border-t text-center text-xs text-muted-foreground">
                <p>
                  By continuing, you agree to Mumbi Farm Management's Terms of Service and Privacy Policy
                </p>
              </div>
            </CardContent>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
}
