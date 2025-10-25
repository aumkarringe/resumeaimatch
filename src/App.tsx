import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CompareResumes from "./pages/CompareResumes";
import ResumeBuilder from "./pages/ResumeBuilder";
import CoverLetterGenerator from "./pages/CoverLetterGenerator";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* Using HashRouter for GitHub Pages */}
      <HashRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/compare" element={<CompareResumes />} />
          <Route path="/builder" element={<ResumeBuilder />} />
          <Route path="/cover-letter" element={<CoverLetterGenerator />} />
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
