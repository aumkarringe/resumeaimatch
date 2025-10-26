import { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { UploadSection } from "@/components/UploadSection";
import { JobDescriptionSection } from "@/components/JobDescriptionSection";
import { AnalysisSection, AnalysisResults } from "@/components/AnalysisSection";
import { ResultsSection } from "@/components/ResultsSection";
import { ContactSearchSection } from "@/components/ContactSearchSection";
import { Navbar } from "@/components/Navbar";
import { extractTextFromFile } from "@/lib/textParser";
import { toast } from "@/hooks/use-toast";

type Step = "hero" | "upload" | "job-description" | "analysis" | "results";

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>("hero");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [results, setResults] = useState<AnalysisResults | null>(null);

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
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
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
          onComplete={handleAnalysisComplete}
        />
      )}
      
      {currentStep === "results" && results && (
        <>
          <ResultsSection results={results} onReset={handleReset} />
          <ContactSearchSection jobDescription={jobDescription} />
        </>
      )}
    </div>
  );
};

export default Index;
