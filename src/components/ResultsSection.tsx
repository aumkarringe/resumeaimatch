import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Lightbulb, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AnalysisResults } from "./AnalysisSection";
import { ScoreGauge } from "./ScoreGauge";

interface ResultsSectionProps {
  results: AnalysisResults;
  onReset: () => void;
}

export const ResultsSection = ({ results, onReset }: ResultsSectionProps) => {
  return (
    <div className="min-h-screen py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Your Resume Analysis
          </h2>
          <p className="text-muted-foreground">
            Here's how your resume matches the job requirements
          </p>
        </div>

        {/* Score Gauge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <ScoreGauge score={results.score} />
        </motion.div>

        {/* Keywords Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Matched Keywords */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <CheckCircle2 className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Matched Keywords</h3>
                  <p className="text-sm text-muted-foreground">
                    {results.matchedKeywords.length} keywords found
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {results.matchedKeywords.map((keyword, index) => (
                  <motion.div
                    key={keyword}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                  >
                    <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                      {keyword}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Missing Keywords */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-destructive/10 p-2 rounded-lg">
                  <XCircle className="text-destructive" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Missing Keywords</h3>
                  <p className="text-sm text-muted-foreground">
                    {results.missingKeywords.length} keywords to add
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {results.missingKeywords.map((keyword, index) => (
                  <motion.div
                    key={keyword}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                  >
                    <Badge variant="secondary" className="bg-destructive/20 text-destructive border-destructive/30">
                      {keyword}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-accent/10 p-2 rounded-lg">
                <Lightbulb className="text-accent" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Improvement Suggestions</h3>
                <p className="text-sm text-muted-foreground">
                  Quick wins to boost your score
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {results.suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-start gap-3 p-4 bg-background/50 rounded-lg"
                >
                  <TrendingUp className="text-accent mt-1 flex-shrink-0" size={20} />
                  <p className="text-foreground">{suggestion}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center gap-4"
        >
          <Button variant="hero" size="lg" onClick={onReset}>
            Analyze Another Resume
          </Button>
          <Button variant="glass" size="lg">
            Export Report
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};
