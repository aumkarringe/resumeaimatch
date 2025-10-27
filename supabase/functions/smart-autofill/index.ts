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
    const { prompt } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const aiPrompt = `You are an expert resume writer. Based on the following user description, generate a complete professional resume with realistic and detailed information.

USER DESCRIPTION:
${prompt}

Generate a comprehensive resume with:
1. Full name (generate a realistic name if not provided)
2. Contact information (email and phone - use realistic formats)
3. Professional summary (3-4 sentences highlighting key strengths)
4. Skills (10-15 relevant skills based on the description)
5. Work experiences (2-4 experiences with company names, roles, durations, and detailed descriptions using action verbs and quantifiable achievements)

Return your response in this EXACT JSON format:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "+1 234 567 8900",
  "summary": "Professional summary text...",
  "skills": "Skill1, Skill2, Skill3, ...",
  "experiences": [
    {
      "id": "1",
      "company": "Company Name",
      "role": "Job Title",
      "duration": "Jan 2020 - Present",
      "description": "• Achievement 1 with quantifiable result\n• Achievement 2 with quantifiable result\n• Achievement 3 with quantifiable result"
    }
  ]
}

Make it professional, ATS-friendly, and use strong action verbs. Include numbers and metrics where appropriate.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: aiPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error);
      throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;

    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse Gemini response:', text);
      throw new Error("Failed to parse Gemini response");
    }

    const result = JSON.parse(jsonMatch[1] || jsonMatch[0]);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in smart-autofill function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
