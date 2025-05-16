
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import AnimalRegistrationForm from "@/components/animals/AnimalRegistrationForm";

export default function AnimalRegister() {
  return (
    <>
      <Helmet>
        <title>Register Animal | Mumbi Farm Management</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <Link to="/animals">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Animals
            </Button>
          </Link>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Register New Animal</h1>
          <p className="text-muted-foreground mb-8">
            Add a new animal to your flock with detailed information
          </p>
        </div>
        
        <div className="bg-white rounded-lg border p-6">
          <AnimalRegistrationForm />
        </div>
      </div>
    </>
  );
}
