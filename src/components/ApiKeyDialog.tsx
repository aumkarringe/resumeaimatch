import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ExternalLink } from "lucide-react";

interface ApiKeyDialogProps {
  open: boolean;
  onSubmit: (apiKey: string) => void;
}

export const ApiKeyDialog = ({ open, onSubmit }: ApiKeyDialogProps) => {
  const [apiKey, setApiKey] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSubmit(apiKey.trim());
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter Your Gemini API Key</DialogTitle>
          <DialogDescription>
            To use AI-powered resume analysis, please provide your Google Gemini API key.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">Gemini API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Don't have an API key?</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
            >
              Get one here
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <Button type="submit" className="w-full" disabled={!apiKey.trim()}>
            Continue
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
