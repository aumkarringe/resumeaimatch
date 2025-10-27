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
      console.error('APOLLO_API_KEY is missing');
      return new Response(
        JSON.stringify({ 
          error: 'Apollo API key not configured. Please add APOLLO_API_KEY in your secrets.',
          contacts: []
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Searching contacts with:', { jobTitle, companyName, region, country });
    console.log('API Key present:', APOLLO_API_KEY ? 'Yes' : 'No');

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

    console.log('Search criteria:', JSON.stringify(searchCriteria, null, 2));

    const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY,
      },
      body: JSON.stringify(searchCriteria),
    });

    console.log('Apollo response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('Apollo API error response:', error);
      
      // Provide more helpful error messages
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid Apollo API key. Please check your APOLLO_API_KEY secret.',
            contacts: []
          }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } else if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Apollo API rate limit exceeded. Please try again later.',
            contacts: []
          }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      throw new Error(`Apollo API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    console.log('Apollo response people count:', data.people?.length || 0);
    console.log('Apollo response data keys:', Object.keys(data));

    // Check if we have results
    if (!data.people || data.people.length === 0) {
      console.log('No contacts found in Apollo response');
      return new Response(
        JSON.stringify({ 
          contacts: [],
          message: 'No contacts found. Try broadening your search criteria.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Extract and format contact information
    const contacts = data.people.map((person: any) => {
      console.log('Processing person:', person.name);
      return {
        name: person.name || 'N/A',
        title: person.title || 'N/A',
        company: person.organization?.name || companyName || 'N/A',
        email: person.email || 'N/A',
        phone: person.phone_numbers?.[0]?.sanitized_number || 'N/A',
        location: person.city && person.state ? `${person.city}, ${person.state}` : person.country || 'N/A',
        linkedinUrl: person.linkedin_url || null,
      };
    });

    console.log('Formatted contacts count:', contacts.length);

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
