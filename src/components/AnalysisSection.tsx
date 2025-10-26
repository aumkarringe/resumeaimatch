import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AnalysisSectionProps {
  onComplete: (results: AnalysisResults) => void;
  resumeText: string;
  jobDescription: string;
}

export interface AnalysisResults {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  starFormatPoints: string[];
  atsOptimizations: string[];
}

export const AnalysisSection = ({ onComplete, resumeText, jobDescription }: AnalysisSectionProps) => {
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let isCancelled = false;

    const performAnalysis = async () => {
      // Simulate progress
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return 90; // Stop at 90% until API completes
          return prev + 10;
        });
      }, 300);

      try {
        const { data, error } = await supabase.functions.invoke('analyze-resume', {
          body: { resumeText, jobDescription }
        });

        if (error) throw error;
        
        if (!isCancelled) {
          setProgress(100);
          setTimeout(() => {
            onComplete(data);
          }, 500);
        }
      } catch (error) {
        console.error("Analysis error:", error);
        if (!isCancelled) {
          toast({
            title: "Analysis Failed",
            description: error instanceof Error ? error.message : "Failed to analyze resume",
            variant: "destructive",
          });
          // Fallback to basic analysis
          setProgress(100);
          setTimeout(() => {
            onComplete(analyzeResumeBasic(resumeText, jobDescription));
          }, 500);
        }
      }
    };

    performAnalysis();

    return () => {
      isCancelled = true;
      clearInterval(progressInterval);
    };
  }, [resumeText, jobDescription, onComplete, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-8"
        >
          <Loader2 className="w-16 h-16 text-primary mx-auto" />
        </motion.div>
        
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Analyzing Your Resume
        </h2>
        <p className="text-muted-foreground mb-8">
          AI is comparing your resume with the job description...
        </p>

        <div className="max-w-md mx-auto">
          <div className="glass h-3 rounded-full overflow-hidden">
            <motion.div
              className="h-full gradient-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-4">{progress}%</p>
        </div>
      </motion.div>
    </div>
  );
};

// Basic fallback analysis if Gemini fails
function analyzeResumeBasic(resumeText: string, jobDescription: string): AnalysisResults {
  const techPatterns = [
    "javascript", "typescript", "python", "java", "c++", "c#", "ruby", "php", "swift", "kotlin",
    "react", "angular", "vue", "node.js", "django", "flask", "spring", "aws", "azure", "docker",
    "kubernetes", "sql", "mongodb", "postgresql", "git", "agile", "rest", "api", "ci/cd"
  ];

  const extractTechnologies = (text: string): Set<string> => {
    const lowerText = text.toLowerCase();
    const found = new Set<string>();
    for (const tech of techPatterns) {
      const regex = new RegExp(`\\b${tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(lowerText)) found.add(tech);
    }
    return found;
  };

  const jobTechnologies = extractTechnologies(jobDescription);
  const resumeTechnologies = extractTechnologies(resumeText);
  const matchedKeywords = [...jobTechnologies].filter(tech => resumeTechnologies.has(tech));
  const missingKeywords = [...jobTechnologies].filter(tech => !resumeTechnologies.has(tech));
  const score = jobTechnologies.size > 0 ? Math.round((matchedKeywords.length / jobTechnologies.size) * 100) : 0;

  return {
    score,
    matchedKeywords,
    missingKeywords,
    suggestions: ["Add missing technologies to your resume", "Quantify your achievements with metrics"],
    starFormatPoints: [],
    atsOptimizations: [],
  };
}
