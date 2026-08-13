import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
});

export async function POST(request: Request) {
  try {
    const { resumeText, jobDescription } = await request.json();
    const hasJobDescription =
      typeof jobDescription === "string" && jobDescription.trim().length > 0;
    if (!resumeText) {
      return NextResponse.json(
        { error: "Resume text is required" },
        { status: 400 },
      );
    }

    const resumeOnlyPrompt = `
You are an expert ATS resume reviewer and technical recruiter.

Analyze the following resume for ATS compatibility and overall resume quality.

There is NO job description provided.

Return ONLY valid JSON using exactly this structure:

{
  "atsScore": 0,
  "summary": "",
  "strengths": [],
  "weaknesses": [],
  "skills": [],
  "missingKeywords": [],
  "improvements": []
}

Rules:

- atsScore must be a number from 0 to 100.
- Evaluate the resume based on general ATS best practices.
- summary should be concise.
- strengths should contain genuine strengths from the resume.
- weaknesses should contain genuine weaknesses from the resume.
- skills should contain important technical skills actually found in the resume.
- missingKeywords should contain useful industry/ATS keywords that are underrepresented in the resume.
- Do NOT compare the resume against a job description.
- Do NOT generate job match scores.
- Do NOT generate matching skills or missing job-specific skills.
- Do NOT invent experience, companies, skills, or achievements.

Resume:

${resumeText}
`;
    const jobDescriptionPrompt = `
You are an expert ATS resume reviewer, technical recruiter, and hiring manager.

Analyze the candidate's resume.

${
  jobDescription?.trim()
    ? `
The candidate has also provided this Job Description.

Compare the resume against the Job Description and identify:
- How well the resume matches the role
- Relevant skills already present
- Important skills or keywords missing from the resume
- Experience alignment
- Actionable improvements

JOB DESCRIPTION:
${jobDescription}
`
    : `
No Job Description was provided.

Perform a general ATS resume analysis.
`
}

Return ONLY valid JSON using exactly this structure:

{
  "atsScore": 0,
  "jobMatchScore": 0,
  "matchLevel": "",
  "experienceMatch": "",
  "summary": "",
  "matchingSkills": [],
  "missingSkills": [],
  "strengths": [],
  "weaknesses": [],
  "skills": [],
  "missingKeywords": [],
  "improvements": []
}

Rules:

- atsScore must be a number from 0 to 100.
- summary should be concise.
- strengths should contain the strongest aspects of the resume.
- weaknesses should contain genuine weaknesses.
- skills should contain important technical skills found in the resume.
- missingKeywords should contain useful keywords that are missing or underrepresented.
- improvements should contain actionable recommendations.
- When a Job Description is provided, prioritize keywords and requirements from that Job Description.
- Do not invent experience, companies, skills, achievements, or qualifications.
- Do not claim that the candidate has a skill unless it appears in the resume.
- Return ONLY JSON.
- Do not wrap the JSON in markdown code fences.
- jobMatchScore must be a number from 0 to 100.
- jobMatchScore must reflect how closely the resume matches the provided job description.
- experienceMatch should briefly explain whether the candidate's experience meets the job requirements.
- matchingSkills should contain skills that are present in both the resume and job description.
- missingSkills should contain important skills explicitly required by the job description but not demonstrated in the resume.
- Do not treat a skill as matching simply because it is similar. Only include skills clearly supported by the resume.

RESUME:
${resumeText}
`;

    const prompt = hasJobDescription ? jobDescriptionPrompt : resumeOnlyPrompt;

    console.log("Sending resume text to Gemini...");

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });

    const text = response.text;

    console.log("Gemini response:", text);

    if (!text) {
      throw new Error("Gemini returned an empty response");
    }

    const cleanedText = text
      .replace(/^```json\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const analysis = JSON.parse(cleanedText);

    console.log("AI analysis result:", analysis);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("AI analysis error:", error);

    return NextResponse.json(
      { error: "Failed to analyze resume with AI" },
      { status: 500 },
    );
  }
}
