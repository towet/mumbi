import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface AuthFormSimpleProps {
  onAuthSuccess: () => void;
}

export function AuthFormSimple({ onAuthSuccess }: AuthFormSimpleProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [isLoading, setIsLoading] = useState(false);
  
  // Form fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  
  // Form validation
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  
  const validateLogin = () => {
    setLoginError("");
    if (!loginEmail) return "Email is required";
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
    
    setIsLoading(true);
    
    try {
      // Since we're just simulating login, we'll make a dummy user
      const dummyUser = {
        id: "user-123",
        username: loginEmail.split('@')[0],
        email: loginEmail,
        role: "user",
        isAuthenticated: true
      };
      
      // Save to localStorage
      localStorage.setItem('mumbi_user', JSON.stringify(dummyUser));
      
      toast({
        title: "Login successful",
        description: "Welcome back to Mumbi Farm Management"
      });
      
      onAuthSuccess();
    } catch (err) {
      console.error("Login error:", err);
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateSignup();
    if (error) {
      setSignupError(error);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create a dummy user (simulate signup)
      const dummyUser = {
        id: "user-" + Date.now(),
        username: signupUsername,
        email: signupEmail,
        role: "user",
        isAuthenticated: true
      };
      
      // Save to localStorage
      localStorage.setItem('mumbi_user', JSON.stringify(dummyUser));
      
      toast({
        title: "Account created successfully",
        description: "Welcome to Mumbi Farm Management"
      });
      
      onAuthSuccess();
    } catch (err) {
      console.error("Signup error:", err);
      toast({
        title: "Signup failed",
        description: "An error occurred during registration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        className="pl-10"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
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
                    disabled={isLoading}
                  >
                    {isLoading ? (
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
              </TabsContent>
              
              <TabsContent value="signup">
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
                    disabled={isLoading}
                  >
                    {isLoading ? (
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
              </TabsContent>
              
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
