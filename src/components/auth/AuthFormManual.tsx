import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';

// Define schemas for form validation
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signupSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

interface AuthFormProps {
  onAuthSuccess: () => void;
}

export function AuthFormManual({ onAuthSuccess }: AuthFormProps) {
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  
  // Create form instances
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  // Login handler - manual implementation
  const onLogin = async (values: LoginFormValues) => {
    try {
      setIsLoggingIn(true);
      
      // Find user by email
      const { data: users, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('email', values.email)
        .limit(1);
      
      if (queryError) throw queryError;
      
      if (!users || users.length === 0) {
        throw new Error("Invalid credentials. Please check your email and password.");
      }
      
      const user = users[0];
      
      // Check password - replace with a proper hashing mechanism
      // For simplicity, we're comparing passwords directly - in production, use proper hashing!
      if (user.password !== values.password) {
        throw new Error("Invalid credentials. Please check your email and password.");
      }
      
      // Set session in localStorage
      localStorage.setItem('mumbi_user', JSON.stringify({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role || 'user',
        isAuthenticated: true
      }));
      
      toast({
        title: "Login successful",
        description: "Welcome back to Mumbi Farm Management",
      });
      
      onAuthSuccess();
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  // Signup handler - manual implementation
  const onSignup = async (values: SignupFormValues) => {
    try {
      setIsSigningUp(true);
      
      // Check if email already exists
      const { data: existingUsers, error: queryError } = await supabase
        .from('users')
        .select('email')
        .eq('email', values.email)
        .limit(1);
      
      if (queryError) throw queryError;
      
      if (existingUsers && existingUsers.length > 0) {
        throw new Error("Email already in use. Please use a different email.");
      }
      
      // Generate a unique ID for the user
      const userId = uuidv4();
      
      // Insert new user into the users table
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          username: values.username,
          email: values.email,
          password: values.password, // In a real app, use bcrypt to hash passwords
          role: 'user',
          created_at: new Date().toISOString(),
        });
      
      if (insertError) throw insertError;
      
      // Set session in localStorage
      localStorage.setItem('mumbi_user', JSON.stringify({
        id: userId,
        email: values.email,
        username: values.username,
        role: 'user',
        isAuthenticated: true
      }));
      
      toast({
        title: "Account created successfully",
        description: "Welcome to Mumbi Farm Management",
      });
      
      onAuthSuccess();
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
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
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-farm-green to-emerald-600 flex items-center justify-center shadow-lg">
            <Leaf className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-farm-green to-emerald-600 bg-clip-text text-transparent">
              Mumbi Farm Management
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to access your farm dashboard
            </CardDescription>
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
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="your.email@example.com"
                                    className="pl-10"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
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
                      </form>
                    </Form>
                    
                    <div className="mt-4 text-center">
                      <Button 
                        variant="link" 
                        onClick={() => setActiveTab("signup")}
                        className="text-farm-green hover:text-emerald-600 underline-offset-4"
                      >
                        Don't have an account? Sign up
                      </Button>
                    </div>
                  </motion.div>
                </TabsContent>
                
                <TabsContent value="signup" key="signup">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Form {...signupForm}>
                      <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                        <FormField
                          control={signupForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="johndoe"
                                    className="pl-10"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={signupForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="your.email@example.com"
                                    className="pl-10"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={signupForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={signupForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
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
                      </form>
                    </Form>
                    
                    <div className="mt-4 text-center">
                      <Button 
                        variant="link" 
                        onClick={() => setActiveTab("login")}
                        className="text-farm-green hover:text-emerald-600 underline-offset-4"
                      >
                        Already have an account? Sign in
                      </Button>
                    </div>
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
