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

    const prompt = `You are an elite ATS (Applicant Tracking System) expert and career coach with deep knowledge of resume optimization, keyword analysis, and hiring practices. Perform an advanced, comprehensive analysis of this resume against the job description.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

ADVANCED ANALYSIS REQUIREMENTS:

1. **ATS Compatibility Score (0-100)**: Analyze:
   - Keyword density and relevance
   - Skills match percentage
   - Experience alignment
   - Education requirements
   - Certifications match
   - Format and structure
   - Action verbs usage
   - Quantifiable achievements

2. **Matched Keywords**: List all technical skills, tools, frameworks, methodologies, and certifications found in BOTH resume and job description. Categorize by type (e.g., Programming Languages, Tools, Soft Skills).

3. **Critical Missing Keywords**: Identify high-priority keywords from the job description that are ABSENT from the resume. Prioritize by importance to the role.

4. **STAR Format Achievement Points**: Generate 5-7 NEW powerful bullet points using the STAR method (Situation, Task, Action, Result) that:
   - Incorporate missing keywords naturally
   - Include quantifiable metrics and results
   - Use strong action verbs
   - Demonstrate impact and value
   - Are tailored to the target role

5. **Advanced ATS Optimization Tips**: Provide 8-10 specific, actionable recommendations covering:
   - Keyword optimization strategies
   - Format improvements for ATS parsing
   - Section organization
   - Action verb enhancements
   - Quantification opportunities
   - Industry-specific terminology
   - Skills section optimization
   - Experience description improvements

6. **Industry-Specific Insights**: Identify the industry and provide tailored advice for that field.

7. **Recommended Action Verbs**: Suggest 10-15 powerful action verbs specific to this role and industry.

8. **Competitive Edge Analysis**: What makes this resume stand out or fall short compared to top candidates?

Return your analysis in this EXACT JSON format:
{
  "score": <number 0-100>,
  "matchedKeywords": {
    "technical": ["keyword1", ...],
    "tools": ["tool1", ...],
    "soft": ["skill1", ...]
  },
  "missingKeywords": {
    "critical": ["keyword1", ...],
    "important": ["keyword2", ...],
    "nice_to_have": ["keyword3", ...]
  },
  "suggestions": ["suggestion1", "suggestion2", ...],
  "starFormatPoints": [
    "• Spearheaded [project] resulting in [quantifiable outcome] by implementing [technology/method]",
    ...
  ],
  "atsOptimizations": [
    "tip1", "tip2", ...
  ],
  "industry": "Software Engineering / Marketing / etc",
  "actionVerbs": ["verb1", "verb2", ...],
  "competitiveEdge": {
    "strengths": ["strength1", ...],
    "gaps": ["gap1", ...]
  }
}

Be extremely specific, actionable, and data-driven. Every suggestion should be implementable immediately.`;

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
