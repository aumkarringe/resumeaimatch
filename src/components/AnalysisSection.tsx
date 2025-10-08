import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

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
}

export const AnalysisSection = ({ onComplete, resumeText, jobDescription }: AnalysisSectionProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate analysis progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Perform actual analysis after 2 seconds
    const analysisTimeout = setTimeout(() => {
      const results = analyzeResume(resumeText, jobDescription);
      onComplete(results);
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(analysisTimeout);
    };
  }, [resumeText, jobDescription, onComplete]);

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

// Simple keyword matching algorithm
function analyzeResume(resumeText: string, jobDescription: string): AnalysisResults {
  // Convert to lowercase and remove punctuation
  const cleanText = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3);

  // Extract keywords from job description
  const stopWords = new Set([
    "with", "and", "the", "for", "this", "that", "will", "from", "have",
    "would", "should", "could", "must", "about", "into", "through", "during",
  ]);

  const jobWords = cleanText(jobDescription).filter((word) => !stopWords.has(word));
  const resumeWords = new Set(cleanText(resumeText));

  // Find matched and missing keywords
  const matchedKeywords = [...new Set(jobWords.filter((word) => resumeWords.has(word)))];
  const missingKeywords = [...new Set(jobWords.filter((word) => !resumeWords.has(word)))].slice(0, 12);

  // Calculate score
  const score = Math.min(Math.round((matchedKeywords.length / jobWords.length) * 100), 100);

  // Generate suggestions
  const suggestions = [
    `Add ${missingKeywords.slice(0, 5).join(", ")} to strengthen your resume`,
    "Quantify your achievements with specific numbers and metrics",
    "Use action verbs to describe your responsibilities",
    "Tailor your summary to highlight relevant experience",
  ];

  return {
    score,
    matchedKeywords: matchedKeywords.slice(0, 15),
    missingKeywords,
    suggestions,
  };
}
