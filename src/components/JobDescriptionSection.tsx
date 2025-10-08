import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface JobDescriptionSectionProps {
  onAnalyze: (jobDescription: string) => void;
}

export const JobDescriptionSection = ({ onAnalyze }: JobDescriptionSectionProps) => {
  const [jobDescription, setJobDescription] = useState("");

  const handleAnalyze = () => {
    if (jobDescription.trim().length < 50) {
      return;
    }
    onAnalyze(jobDescription);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-3xl w-full"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Paste the Job Description
        </h2>
        <p className="text-muted-foreground text-center mb-8">
          Copy and paste the job description you're applying for
        </p>

        <div className="glass p-8 rounded-2xl">
          <Textarea
            placeholder="Paste the job description here... Include requirements, responsibilities, and desired qualifications."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="min-h-[300px] text-base resize-none bg-background/50 border-border/50"
          />

          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-muted-foreground">
              {jobDescription.length} characters
            </p>
            <Button
              variant="hero"
              size="lg"
              onClick={handleAnalyze}
              disabled={jobDescription.trim().length < 50}
            >
              <Sparkles className="mr-2" size={20} />
              Analyze Resume
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
