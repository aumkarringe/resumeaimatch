import { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { UploadSection } from "@/components/UploadSection";
import { JobDescriptionSection } from "@/components/JobDescriptionSection";
import { AnalysisSection, AnalysisResults } from "@/components/AnalysisSection";
import { ResultsSection } from "@/components/ResultsSection";
import { ApiKeyDialog } from "@/components/ApiKeyDialog";
import { Navbar } from "@/components/Navbar";
import { extractTextFromFile } from "@/lib/textParser";
import { toast } from "@/hooks/use-toast";

type Step = "hero" | "upload" | "job-description" | "analysis" | "results";

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>("hero");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);

  const handleFileUpload = async (file: File) => {
    try {
      const text = await extractTextFromFile(file);
      setResumeText(text);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to read text file. Please try another file.",
        variant: "destructive",
      });
    }
  };

  const handleAnalyze = (description: string) => {
    setJobDescription(description);
    if (!geminiApiKey) {
      setShowApiKeyDialog(true);
    } else {
      setCurrentStep("analysis");
    }
  };

  const handleApiKeySubmit = (apiKey: string) => {
    setGeminiApiKey(apiKey);
    setShowApiKeyDialog(false);
    setCurrentStep("analysis");
  };

  const handleAnalysisComplete = (analysisResults: AnalysisResults) => {
    setResults(analysisResults);
    setCurrentStep("results");
  };

  const handleReset = () => {
    setCurrentStep("hero");
    setResumeText("");
    setJobDescription("");
    setResults(null);
    // Keep API key for subsequent analyses
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <ApiKeyDialog open={showApiKeyDialog} onSubmit={handleApiKeySubmit} />
      
      {currentStep === "hero" && (
        <HeroSection onGetStarted={() => setCurrentStep("upload")} />
      )}
      
      {currentStep === "upload" && (
        <UploadSection
          onFileUpload={handleFileUpload}
          onNext={() => setCurrentStep("job-description")}
        />
      )}
      
      {currentStep === "job-description" && (
        <JobDescriptionSection onAnalyze={handleAnalyze} />
      )}
      
      {currentStep === "analysis" && (
        <AnalysisSection
          resumeText={resumeText}
          jobDescription={jobDescription}
          geminiApiKey={geminiApiKey}
          onComplete={handleAnalysisComplete}
        />
      )}
      
      {currentStep === "results" && results && (
        <ResultsSection results={results} onReset={handleReset} />
      )}
    </div>
  );
};

export default Index;
