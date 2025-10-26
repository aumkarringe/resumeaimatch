import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobTitle, companyName, region, country } = await req.json();
    const APOLLO_API_KEY = Deno.env.get('APOLLO_API_KEY');

    if (!APOLLO_API_KEY) {
      throw new Error('APOLLO_API_KEY not configured');
    }

    console.log('Searching contacts with:', { jobTitle, companyName, region, country });

    // Build search criteria
    const searchCriteria: any = {
      page: 1,
      per_page: 10,
    };

    // Add person titles filter for recruiters, founders, VPs
    searchCriteria.person_titles = [
      "Recruiter",
      "Talent Acquisition",
      "HR Manager",
      "Hiring Manager",
      "Founder",
      "Co-Founder",
      "CEO",
      "Chief Executive Officer",
      "VP",
      "Vice President",
      "Head of Talent",
      "Head of HR"
    ];

    if (companyName) {
      searchCriteria.organization_names = [companyName];
    }

    if (country) {
      searchCriteria.person_locations = [country];
    }

    const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY,
      },
      body: JSON.stringify(searchCriteria),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Apollo API error:', error);
      throw new Error(`Apollo API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    console.log('Apollo response:', JSON.stringify(data, null, 2));

    // Extract and format contact information
    const contacts = (data.people || []).map((person: any) => ({
      name: person.name || 'N/A',
      title: person.title || 'N/A',
      company: person.organization?.name || 'N/A',
      email: person.email || 'N/A',
      phone: person.phone_numbers?.[0]?.sanitized_number || 'N/A',
      location: person.city && person.state ? `${person.city}, ${person.state}` : person.country || 'N/A',
      linkedinUrl: person.linkedin_url || null,
    }));

    return new Response(
      JSON.stringify({ contacts }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in search-contacts function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
