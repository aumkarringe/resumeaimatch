import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SkillsOptimizerProps {
  currentSkills: string;
  jobDescription: string;
  onOptimize: (skills: string) => void;
}

export const SkillsOptimizer = ({ currentSkills, jobDescription, onOptimize }: SkillsOptimizerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  const handleOptimize = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Add Job Description",
        description: "Please add a target job description first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('optimize-skills', {
        body: { currentSkills, jobDescription }
      });

      if (error) throw error;

      setSuggestions(data.suggestedSkills);
      toast({
        title: "Skills Optimized",
        description: `Found ${data.suggestedSkills.length} skill suggestions`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to optimize skills",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = (skill: string) => {
    const skillsArray = currentSkills.split(',').map(s => s.trim()).filter(Boolean);
    if (!skillsArray.includes(skill)) {
      const newSkills = [...skillsArray, skill].join(', ');
      onOptimize(newSkills);
      setSuggestions(suggestions.filter(s => s !== skill));
      toast({
        title: "Skill Added",
        description: `Added "${skill}" to your skills`,
      });
    }
  };

  return (
    <Card className="p-4 mt-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Skills Optimizer
        </h3>
        <Button onClick={handleOptimize} disabled={isLoading} size="sm" variant="outline">
          <Sparkles className="w-3 h-3 mr-1" />
          {isLoading ? "Analyzing..." : "Optimize"}
        </Button>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Recommended skills based on job description:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => addSkill(skill)}
              >
                + {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
