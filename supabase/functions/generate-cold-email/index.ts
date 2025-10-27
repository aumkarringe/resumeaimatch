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
    const { recipientName, recipientTitle, companyName, customPrompt, jobDescription, resumeText } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const prompt = `You are an expert at writing professional cold emails for job applications.

Generate a compelling cold email with the following context:
- Recipient: ${recipientName}
- Title: ${recipientTitle}
- Company: ${companyName}
- Job Description: ${jobDescription}

MY RESUME:
${resumeText}

Additional Instructions: ${customPrompt || 'Write a professional, personalized cold email'}

Write a professional, personalized cold email that:
1. Has a compelling subject line
2. Opens with a strong hook
3. Demonstrates research about the company
4. Highlights relevant skills and experience
5. Includes a clear call-to-action
6. Is concise (under 200 words)

Return the email in this JSON format:
{
  "subject": "email subject line",
  "body": "email body content"
}`;

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
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
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
      JSON.stringify({
        subject: result.subject || '',
        body: result.body || '',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-cold-email function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
