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
    const { resumeText, jobDescription } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const prompt = `You are an expert ATS (Applicant Tracking System) resume analyzer. Analyze the following resume against the job description and provide detailed feedback.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Analyze and provide:
1. A compatibility score (0-100) based on how well the resume matches the job requirements
2. List of matched technical skills/keywords found in both resume and job description
3. List of missing technical skills/keywords from the job description that are not in the resume
4. 3-5 new resume bullet points in STAR format (Situation, Task, Action, Result) that the candidate should add to better match the job description
5. ATS optimization tips specific to this resume and job description

Return your analysis in the following JSON format:
{
  "score": <number 0-100>,
  "matchedKeywords": ["keyword1", "keyword2", ...],
  "missingKeywords": ["keyword1", "keyword2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...],
  "starFormatPoints": ["STAR point 1", "STAR point 2", ...],
  "atsOptimizations": ["tip1", "tip2", ...]
}

Be specific and actionable. Focus on technical skills, tools, frameworks, and measurable achievements.`;

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
            temperature: 0.7,
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
      JSON.stringify({
        score: Math.min(Math.max(result.score || 0, 0), 100),
        matchedKeywords: result.matchedKeywords || [],
        missingKeywords: result.missingKeywords || [],
        suggestions: result.suggestions || [],
        starFormatPoints: result.starFormatPoints || [],
        atsOptimizations: result.atsOptimizations || [],
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in analyze-resume function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
