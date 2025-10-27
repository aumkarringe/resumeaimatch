import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Users, Mail, Phone, MapPin, Linkedin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Contact {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl?: string;
}

interface ContactSearchSectionProps {
  jobDescription: string;
  resumeText: string;
}

export const ContactSearchSection = ({ jobDescription, resumeText }: ContactSearchSectionProps) => {
  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const { toast } = useToast();

  const searchContacts = async () => {
    if (!companyName.trim()) {
      toast({
        title: "Company Name Required",
        description: "Please enter a company name to search",
        variant: "destructive",
      });
      return;
    }

    setSearching(true);
    setContacts([]); // Clear previous results
    try {
      console.log('Invoking search-contacts with:', { companyName, country });
      
      const { data, error } = await supabase.functions.invoke('search-contacts', {
        body: {
          companyName,
          country: country || undefined,
          jobTitle: jobDescription.slice(0, 100)
        }
      });

      console.log('Search response:', data);
      console.log('Search error:', error);

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data.error) {
        // Handle errors returned from the edge function
        toast({
          title: "Search Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setContacts(data.contacts || []);
      
      if (!data.contacts || data.contacts.length === 0) {
        toast({
          title: "No Contacts Found",
          description: data.message || "Try adjusting your search criteria. Make sure your Apollo API key is valid.",
        });
      } else {
        toast({
          title: "Contacts Found",
          description: `Found ${data.contacts.length} relevant contacts`,
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "Failed to search contacts. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Find Recruiters & Hiring Managers</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label>Company Name *</Label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Google"
              />
            </div>
            <div>
              <Label>Country (Optional)</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="India">India</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={searchContacts}
                disabled={searching}
                className="w-full"
              >
                {searching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  "Search Contacts"
                )}
              </Button>
            </div>
          </div>
        </Card>

        {contacts.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            {contacts.map((contact, index) => (
              <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{contact.name}</h3>
                    <p className="text-sm text-muted-foreground">{contact.title}</p>
                    <p className="text-sm font-medium">{contact.company}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setSelectedContact(contact)}
                  >
                    Generate Cold Email
                  </Button>
                </div>
                
                <div className="space-y-2 text-sm">
                  {contact.email !== 'N/A' && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{contact.email}</span>
                    </div>
                  )}
                  {contact.phone !== 'N/A' && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                  {contact.location !== 'N/A' && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{contact.location}</span>
                    </div>
                  )}
                  {contact.linkedinUrl && (
                    <div className="flex items-center gap-2">
                      <Linkedin className="w-4 h-4 text-muted-foreground" />
                      <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {selectedContact && (
          <ColdEmailGenerator
            contact={selectedContact}
            jobDescription={jobDescription}
            resumeText={resumeText}
            onClose={() => setSelectedContact(null)}
          />
        )}
      </motion.div>
    </div>
  );
};

interface ColdEmailGeneratorProps {
  contact: Contact;
  jobDescription: string;
  resumeText: string;
  onClose: () => void;
}

const ColdEmailGenerator = ({ contact, jobDescription, resumeText, onClose }: ColdEmailGeneratorProps) => {
  const [customPrompt, setCustomPrompt] = useState("");
  const [email, setEmail] = useState<{ subject: string; body: string } | null>(null);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const generateEmail = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-cold-email', {
        body: {
          recipientName: contact.name,
          recipientTitle: contact.title,
          companyName: contact.company,
          customPrompt,
          jobDescription,
          resumeText
        }
      });

      if (error) throw error;

      setEmail(data);
      toast({
        title: "Email Generated",
        description: "Your cold email is ready",
      });
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate email",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyEmail = () => {
    if (email) {
      navigator.clipboard.writeText(`Subject: ${email.subject}\n\n${email.body}`);
      toast({ title: "Copied!", description: "Email copied to clipboard" });
    }
  };

  return (
    <Card className="p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Generate Cold Email for {contact.name}</h3>
        <Button variant="ghost" onClick={onClose}>Close</Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Custom Instructions (Optional)</Label>
          <Input
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g., Keep it casual, mention my startup experience"
          />
        </div>

        <Button
          onClick={generateEmail}
          disabled={generating}
          className="w-full"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Cold Email"
          )}
        </Button>

        {email && (
          <div className="space-y-4">
            <div>
              <Label>Subject</Label>
              <div className="p-3 bg-accent/30 rounded-lg font-medium">
                {email.subject}
              </div>
            </div>
            <div>
              <Label>Body</Label>
              <div className="p-4 bg-accent/30 rounded-lg whitespace-pre-wrap">
                {email.body}
              </div>
            </div>
            <Button onClick={copyEmail} variant="outline" className="w-full">
              Copy Email
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
