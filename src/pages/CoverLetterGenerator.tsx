import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Copy, Download, Sparkles } from "lucide-react";
import { ApiKeyDialog } from "@/components/ApiKeyDialog";
import { extractTextFromFile } from "@/lib/textParser";
import { useToast } from "@/hooks/use-toast";

const CoverLetterGenerator = () => {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [hiringManager, setHiringManager] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [generating, setGenerating] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;
    try {
      const text = await extractTextFromFile(file);
      setResumeText(text);
      toast({
        title: "Resume Uploaded",
        description: "Resume text extracted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to read resume file",
        variant: "destructive",
      });
    }
  };

  const generateCoverLetter = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both resume and job description",
        variant: "destructive",
      });
      return;
    }

    if (!geminiApiKey) {
      setShowApiKeyDialog(true);
      return;
    }

    setGenerating(true);
    
    const prompt = `You are an expert cover letter writer. Create a professional, compelling cover letter based on the following information:

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

${companyName ? `COMPANY NAME: ${companyName}` : ""}
${hiringManager ? `HIRING MANAGER: ${hiringManager}` : ""}

Write a cover letter that:
1. Opens with a strong hook that shows enthusiasm and relevant experience
2. Highlights 2-3 key achievements from the resume that directly match the job requirements
3. Demonstrates understanding of the company and role
4. Shows personality while remaining professional
5. Closes with a clear call to action

Keep it concise (3-4 paragraphs), engaging, and tailored to this specific role. Use professional business letter format.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.8,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to generate cover letter");

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      setCoverLetter(generatedText);
      
      toast({
        title: "Cover Letter Generated",
        description: "Your personalized cover letter is ready!",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate cover letter",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter);
    toast({ title: "Copied!", description: "Cover letter copied to clipboard" });
  };

  const downloadCoverLetter = () => {
    const blob = new Blob([coverLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Cover_Letter_${companyName || "Job"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
            AI Cover Letter Generator
          </h1>
          <p className="text-muted-foreground text-lg">
            Generate personalized cover letters that match your resume and the job
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Your Resume</h2>
              <div className="space-y-4">
                <div>
                  <input
                    type="file"
                    id="resume-upload"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById("resume-upload")?.click()}
                  >
                    Upload Resume
                  </Button>
                </div>
                <Textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Or paste your resume text here..."
                  className="min-h-[200px]"
                />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Job Details</h2>
              <div className="space-y-4">
                <div>
                  <Label>Company Name (Optional)</Label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Google"
                  />
                </div>
                <div>
                  <Label>Hiring Manager (Optional)</Label>
                  <Input
                    value={hiringManager}
                    onChange={(e) => setHiringManager(e.target.value)}
                    placeholder="e.g., Sarah Johnson"
                  />
                </div>
                <div>
                  <Label>Job Description</Label>
                  <Textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here..."
                    className="min-h-[200px]"
                  />
                </div>
              </div>
            </Card>

            <Button
              onClick={generateCoverLetter}
              disabled={generating || !resumeText.trim() || !jobDescription.trim()}
              className="w-full"
              size="lg"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Cover Letter
                </>
              )}
            </Button>
          </div>

          {/* Output Section */}
          <div>
            <Card className="p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Generated Cover Letter</h2>
                {coverLetter && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadCoverLetter}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {coverLetter ? (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-accent/30 p-4 rounded-lg">
                    {coverLetter}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Your cover letter will appear here</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterGenerator;
