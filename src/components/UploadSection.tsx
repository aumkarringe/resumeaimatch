import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface UploadSectionProps {
  onFileUpload: (file: File) => void;
  onNext: () => void;
}

export const UploadSection = ({ onFileUpload, onNext }: UploadSectionProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        onFileUpload(droppedFile);
        toast({
          title: "Resume uploaded!",
          description: "Your resume has been successfully uploaded.",
        });
      } else {
        toast({
          title: "Invalid file",
          description: "Please upload a PDF file.",
          variant: "destructive",
        });
      }
    },
    [onFileUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile && selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        onFileUpload(selectedFile);
        toast({
          title: "Resume uploaded!",
          description: "Your resume has been successfully uploaded.",
        });
      }
    },
    [onFileUpload]
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Upload Your Resume
        </h2>
        <p className="text-muted-foreground text-center mb-8">
          Upload your PDF resume to get started with the analysis
        </p>

        <motion.div
          className={`glass p-12 rounded-2xl border-2 transition-all ${
            isDragging ? "border-primary glow-purple" : "border-border/50"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          whileHover={{ scale: 1.02 }}
        >
          {!file ? (
            <label className="flex flex-col items-center justify-center cursor-pointer">
              <Upload className="w-16 h-16 text-primary mb-4 animate-float" />
              <p className="text-xl font-semibold mb-2">
                Drop your resume here
              </p>
              <p className="text-muted-foreground mb-4">or click to browse</p>
              <Button variant="hero" size="lg">
                Select PDF File
              </Button>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex flex-col items-center">
              <FileText className="w-16 h-16 text-primary mb-4" />
              <p className="text-lg font-semibold mb-2">{file.name}</p>
              <p className="text-muted-foreground mb-4">
                {(file.size / 1024).toFixed(2)} KB
              </p>
              <div className="flex gap-4">
                <Button
                  variant="hero"
                  size="lg"
                  onClick={onNext}
                >
                  Continue
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setFile(null)}
                >
                  <X className="mr-2" size={20} />
                  Remove
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};
