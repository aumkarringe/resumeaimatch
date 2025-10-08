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

// Technology-focused matching algorithm
function analyzeResume(resumeText: string, jobDescription: string): AnalysisResults {
  // Common technology keywords and patterns
  const techPatterns = [
    // Programming Languages
    "javascript", "typescript", "python", "java", "c++", "c#", "ruby", "php", "swift", "kotlin",
    "go", "rust", "scala", "perl", "r", "matlab", "sql", "html", "css",
    
    // Frameworks & Libraries
    "react", "angular", "vue", "svelte", "next.js", "nextjs", "node.js", "nodejs", "express",
    "django", "flask", "spring", "laravel", "rails", "asp.net", "jquery", "bootstrap", "tailwind",
    
    // Databases
    "mysql", "postgresql", "mongodb", "redis", "elasticsearch", "cassandra", "oracle", "sqlite",
    "dynamodb", "firebase", "supabase",
    
    // Cloud & DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "terraform", "ansible", "git",
    "github", "gitlab", "ci/cd", "cicd",
    
    // Tools & Platforms
    "linux", "unix", "windows", "macos", "vscode", "intellij", "eclipse", "jira", "confluence",
    "slack", "trello", "figma", "sketch", "photoshop",
    
    // Methodologies & Concepts
    "agile", "scrum", "kanban", "devops", "microservices", "api", "rest", "graphql", "oauth",
    "jwt", "testing", "tdd", "bdd", "ci", "cd",
    
    // Data & AI
    "machine learning", "deep learning", "tensorflow", "pytorch", "pandas", "numpy", "scikit-learn",
    "data analysis", "data science", "nlp", "computer vision",
  ];

  // Extract technologies from text
  const extractTechnologies = (text: string): Set<string> => {
    const lowerText = text.toLowerCase();
    const found = new Set<string>();
    
    for (const tech of techPatterns) {
      // Use word boundaries to match whole words/phrases
      const regex = new RegExp(`\\b${tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(lowerText)) {
        found.add(tech);
      }
    }
    
    return found;
  };

  // Extract technologies from both texts
  const jobTechnologies = extractTechnologies(jobDescription);
  const resumeTechnologies = extractTechnologies(resumeText);

  // Find matched and missing technologies
  const matchedKeywords = [...jobTechnologies].filter(tech => resumeTechnologies.has(tech));
  const missingKeywords = [...jobTechnologies].filter(tech => !resumeTechnologies.has(tech));

  // Calculate score based on technology match
  const score = jobTechnologies.size > 0
    ? Math.min(Math.round((matchedKeywords.length / jobTechnologies.size) * 100), 100)
    : 0;

  // Generate suggestions
  const suggestions = [];
  
  if (missingKeywords.length > 0) {
    suggestions.push(`Add these technologies to your resume: ${missingKeywords.slice(0, 5).join(", ")}`);
  }
  
  if (matchedKeywords.length > 0) {
    suggestions.push(`Highlight your experience with ${matchedKeywords.slice(0, 3).join(", ")} in your summary`);
  }
  
  suggestions.push("Quantify your technical achievements with specific metrics and results");
  suggestions.push("Include relevant projects or portfolio links showcasing these technologies");

  return {
    score,
    matchedKeywords: matchedKeywords.slice(0, 20),
    missingKeywords: missingKeywords.slice(0, 15),
    suggestions,
  };
}
