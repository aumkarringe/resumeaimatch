import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Linkedin, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LinkedInImportProps {
  onImport: (data: {
    name: string;
    email: string;
    phone: string;
    summary: string;
    skills: string;
    experiences: Array<{
      id: string;
      company: string;
      role: string;
      duration: string;
      description: string;
    }>;
  }) => void;
}

export const LinkedInImport = ({ onImport }: LinkedInImportProps) => {
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [quickPrompt, setQuickPrompt] = useState("");
  const { toast } = useToast();

  const handleLinkedInImport = async () => {
    if (!linkedInUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a LinkedIn profile URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Note: This is a placeholder. LinkedIn scraping requires proper API access or browser extension
      toast({
        title: "LinkedIn Import",
        description: "LinkedIn import requires browser extension or API access. Use Smart Autofill instead for now.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import LinkedIn profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSmartAutofill = async () => {
    if (!quickPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please describe your background",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('smart-autofill', {
        body: { prompt: quickPrompt }
      });

      if (error) throw error;

      onImport(data);
      toast({
        title: "Success",
        description: "Resume autofilled successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to autofill resume",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5" />
        Quick Start Options
      </h2>
      
      <div className="space-y-6">
        {/* Smart Autofill */}
        <div className="space-y-3">
          <Label className="text-base">AI Smart Autofill</Label>
          <p className="text-sm text-muted-foreground">
            Describe your background and let AI generate your resume
          </p>
          <Textarea
            placeholder="e.g., I'm a senior software engineer with 5 years experience in React, TypeScript, and AWS..."
            value={quickPrompt}
            onChange={(e) => setQuickPrompt(e.target.value)}
            className="min-h-[80px]"
          />
          <Button 
            onClick={handleSmartAutofill} 
            disabled={isLoading}
            className="w-full"
            variant="default"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isLoading ? "Generating..." : "Generate Resume"}
          </Button>
        </div>

        {/* LinkedIn Import */}
        <div className="space-y-3 pt-4 border-t">
          <Label className="text-base">Import from LinkedIn</Label>
          <p className="text-sm text-muted-foreground">
            Coming soon: Direct LinkedIn profile import
          </p>
          <Input
            placeholder="https://linkedin.com/in/yourprofile"
            value={linkedInUrl}
            onChange={(e) => setLinkedInUrl(e.target.value)}
            disabled={true}
          />
          <Button 
            onClick={handleLinkedInImport}
            disabled={true}
            variant="outline"
            className="w-full"
          >
            <Linkedin className="w-4 h-4 mr-2" />
            Import from LinkedIn (Coming Soon)
          </Button>
        </div>
      </div>
    </Card>
  );
};
