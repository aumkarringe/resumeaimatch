import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, X, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ApiKeyDialog } from "@/components/ApiKeyDialog";
import { extractTextFromFile } from "@/lib/textParser";
import { analyzeResumeWithGemini } from "@/lib/geminiClient";
import { ScoreGauge } from "@/components/ScoreGauge";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ResumeData {
  id: string;
  file: File;
  text: string;
  score?: number;
  matchedKeywords?: string[];
  missingKeywords?: string[];
}

const CompareResumes = () => {
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    const newResumes: ResumeData[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const text = await extractTextFromFile(file);
        newResumes.push({
          id: `${Date.now()}-${i}`,
          file,
          text,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to read ${file.name}`,
          variant: "destructive",
        });
      }
    }
    setResumes((prev) => [...prev, ...newResumes]);
  };

  const removeResume = (id: string) => {
    setResumes((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Missing Job Description",
        description: "Please enter a job description",
        variant: "destructive",
      });
      return;
    }

    if (resumes.length < 2) {
      toast({
        title: "Upload More Resumes",
        description: "Please upload at least 2 resumes to compare",
        variant: "destructive",
      });
      return;
    }

    if (!geminiApiKey) {
      setShowApiKeyDialog(true);
      return;
    }

    setAnalyzing(true);
    const analyzedResumes = await Promise.all(
      resumes.map(async (resume) => {
        try {
          const results = await analyzeResumeWithGemini(
            resume.text,
            jobDescription,
            geminiApiKey
          );
          return { ...resume, ...results };
        } catch (error) {
          toast({
            title: "Analysis Failed",
            description: `Failed to analyze ${resume.file.name}`,
            variant: "destructive",
          });
          return resume;
        }
      })
    );
    setResumes(analyzedResumes);
    setAnalyzing(false);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <ApiKeyDialog open={showApiKeyDialog} onSubmit={(key) => { setGeminiApiKey(key); setShowApiKeyDialog(false); }} />
      
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Compare Multiple Resumes
          </h1>
          <p className="text-muted-foreground text-lg">
            Upload multiple resumes and see which one matches best
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Upload Section */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Resumes</h2>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                id="resume-upload"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
              <label htmlFor="resume-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, DOC, DOCX, or TXT (Multiple files supported)
                </p>
              </label>
            </div>

            {resumes.length > 0 && (
              <div className="mt-4 space-y-2">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm truncate max-w-[200px]">
                        {resume.file.name}
                      </span>
                      {resume.score !== undefined && (
                        <Badge variant="secondary">{resume.score}%</Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeResume(resume.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Job Description Section */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Job Description</h2>
            <Textarea
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-[300px] resize-none"
            />
            <Button
              onClick={handleAnalyze}
              disabled={analyzing || resumes.length < 2 || !jobDescription.trim()}
              className="w-full mt-4"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Compare Resumes"
              )}
            </Button>
          </Card>
        </div>

        {/* Comparison Results */}
        {resumes.some((r) => r.score !== undefined) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {resumes
              .filter((r) => r.score !== undefined)
              .sort((a, b) => (b.score || 0) - (a.score || 0))
              .map((resume, index) => (
                <Card key={resume.id} className="p-6">
                  {index === 0 && (
                    <Badge className="mb-4 gradient-primary">Best Match</Badge>
                  )}
                  <h3 className="font-semibold mb-4 truncate">{resume.file.name}</h3>
                  <div className="scale-50 -my-20">
                    <ScoreGauge score={resume.score || 0} />
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">Matched Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {resume.matchedKeywords?.slice(0, 5).map((kw) => (
                          <Badge key={kw} variant="secondary" className="text-xs">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Missing Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {resume.missingKeywords?.slice(0, 5).map((kw) => (
                          <Badge key={kw} variant="outline" className="text-xs">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CompareResumes;
