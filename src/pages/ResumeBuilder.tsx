import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScoreGauge } from "@/components/ScoreGauge";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Experience {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
}

const ResumeBuilder = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");
  const [experiences, setExperiences] = useState<Experience[]>([
    { id: "1", company: "", role: "", duration: "", description: "" },
  ]);
  const [jobDescription, setJobDescription] = useState("");
  const [score, setScore] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  const addExperience = () => {
    setExperiences([
      ...experiences,
      { id: Date.now().toString(), company: "", role: "", duration: "", description: "" },
    ]);
  };

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter((exp) => exp.id !== id));
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setExperiences(
      experiences.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };

  const buildResumeText = () => {
    const expText = experiences
      .map((exp) => `${exp.role} at ${exp.company} (${exp.duration})\n${exp.description}`)
      .join("\n\n");
    return `${name}\n${email} | ${phone}\n\nSUMMARY:\n${summary}\n\nSKILLS:\n${skills}\n\nEXPERIENCE:\n${expText}`;
  };

  useEffect(() => {
    const analyzeResume = async () => {
      if (!jobDescription.trim()) return;

      const resumeText = buildResumeText();
      if (!resumeText.trim()) return;

      try {
        const { data, error } = await supabase.functions.invoke('analyze-resume', {
          body: { resumeText, jobDescription }
        });
        if (!error) {
          setScore(data.score);
          setSuggestions(data.suggestions);
        }
      } catch (error) {
        // Silent fail for real-time scoring
      }
    };

    const debounce = setTimeout(analyzeResume, 1000);
    return () => clearTimeout(debounce);
  }, [name, email, phone, summary, skills, experiences, jobDescription]);

  const handleExport = () => {
    const resumeText = buildResumeText();
    const blob = new Blob([resumeText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/\s+/g, "_")}_Resume.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Resume Builder with Live ATS Scoring
          </h1>
          <p className="text-muted-foreground text-lg">
            Build your resume and see real-time ATS compatibility score
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Resume Builder Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 8900" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Professional Summary</h2>
              <Textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief overview of your professional background..."
                className="min-h-[100px]"
              />
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Skills</h2>
              <Textarea
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, TypeScript, Node.js, Python, AWS..."
                className="min-h-[80px]"
              />
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Work Experience</h2>
                <Button onClick={addExperience} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
              <div className="space-y-6">
                {experiences.map((exp) => (
                  <div key={exp.id} className="p-4 border border-border rounded-lg space-y-3">
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExperience(exp.id)}
                        disabled={experiences.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Input
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                        placeholder="Company Name"
                      />
                      <Input
                        value={exp.role}
                        onChange={(e) => updateExperience(exp.id, "role", e.target.value)}
                        placeholder="Job Title"
                      />
                    </div>
                    <Input
                      value={exp.duration}
                      onChange={(e) => updateExperience(exp.id, "duration", e.target.value)}
                      placeholder="Duration (e.g., Jan 2020 - Present)"
                    />
                    <Textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                      placeholder="Describe your responsibilities and achievements..."
                      className="min-h-[100px]"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Live Scoring Panel */}
          <div className="space-y-6">
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Live ATS Score</h2>
              
              <div className="scale-50 -my-20">
                <ScoreGauge score={score} />
              </div>

              <div className="mt-6">
                <Label>Target Job Description</Label>
                <Textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste job description for real-time scoring..."
                  className="min-h-[150px] mt-2"
                />
              </div>

              {suggestions.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Quick Suggestions</h3>
                  <div className="space-y-2">
                    {suggestions.slice(0, 3).map((suggestion, i) => (
                      <div key={i} className="text-sm p-3 bg-accent/50 rounded-lg">
                        {suggestion}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={handleExport} className="w-full mt-6" disabled={!name.trim()}>
                <Download className="w-4 h-4 mr-2" />
                Export Resume
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
