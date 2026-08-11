import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { PDFParse } from "pdf-parse";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Resume PDF is required" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parser = new PDFParse({ data: buffer });
    const pdfData = await parser.getText();

    const resumeText = pdfData.text;

    await parser.destroy();

    if (!resumeText.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from the resume" },
        { status: 400 },
      );
    }

    // 2. Send extracted text to Gemini
    const prompt = `
You are an expert ATS resume reviewer and technical recruiter.

Analyze the following resume.

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
- summary should be concise.
- strengths should contain the strongest aspects of the resume.
- weaknesses should contain genuine weaknesses.
- skills should contain important technical skills found in the resume.
- missingKeywords should contain useful keywords that appear to be missing or underrepresented.
- improvements should contain actionable recommendations.
- Do not invent experience, companies, skills, or achievements.

Resume:

${resumeText}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text;

    console.log("Gemini response:", text);
    if (!text) {
      throw new Error("Gemini returned an empty response");
    }

    // 3. Clean Gemini response
    const cleanedText = text
      .replace(/^```json\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // 4. Convert Gemini JSON string into object
    const analysis = JSON.parse(cleanedText);


    console.log("AI analysis result:", analysis);
    // 5. Return analysis
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
