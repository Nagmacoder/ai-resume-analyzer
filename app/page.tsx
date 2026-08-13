"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{
    atsScore: number;
    matchLevel: string;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    skills: string[];
    missingKeywords: string[];
    improvements: string[];
    jobMatchScore: number;
    experienceMatch: string;
    matchingSkills: string[];
    missingSkills: string[];
  } | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!file) {
      alert("Please upload a PDF resume.");
      return;
    }

    if (jobDescription.trim().length > 0 && jobDescription.trim().length < 50) {
      alert("Please enter a more complete job description.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Step 1: Upload PDF and extract text
      const formData = new FormData();
      formData.append("resume", file);

      console.log("Step 1: Extracting resume text...");

      const extractResponse = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const extractData = await extractResponse.json();

      console.log("Extract API response:", extractData);

      if (!extractResponse.ok) {
        throw new Error(extractData.error || "Failed to extract resume text");
      }

      const resumeText = extractData.text;

      if (!resumeText) {
        throw new Error("No resume text extracted");
      }

      // Step 2: Send extracted text to Gemini
      console.log("Step 2: Sending resume to Gemini...");

      const aiResponse = await fetch("/api/ai-analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeText,
          jobDescription,
        }),
      });

      const aiData = await aiResponse.json();

      console.log("AI API response:", aiData);

      if (!aiResponse.ok) {
        throw new Error(aiData.error || "Failed to analyze resume");
      }

      if (!aiData.analysis) {
        throw new Error("No analysis returned from AI");
      }

      // Step 3: Display analysis
      setResult(aiData.analysis);
    } catch (error) {
      console.error("Analysis error:", error);
      alert("Failed to analyze resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-5xl font-bold text-gray-900">AI Resume Analyzer</h1>

        <p className="mt-4 text-lg text-gray-600">
          Analyze your resume with AI and discover how to improve your ATS
          score.
        </p>

        <div className="mt-10 rounded-2xl bg-white p-10 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">
            Upload Your Resume
          </h2>

          <p className="mt-2 text-gray-500">
            Upload your PDF resume to get started.
          </p>

          <input
            type="file"
            accept=".pdf"
            onChange={(event) => {
              setFile(event.target.files?.[0] || null);
            }}
            className="mt-6 cursor-pointer block w-full rounded-lg border border-gray-300 p-3 text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700"
          />
          <div className="mt-8">
            <label
              htmlFor="jobDescription"
              className="block text-sm font-semibold text-slate-900"
            >
              Job Description
              <span className="ml-1 font-normal text-slate-500">
                (optional)
              </span>
            </label>

            <p className="mt-1 text-sm text-slate-500">
              Paste the job description to see how well your resume matches the
              role.
            </p>

            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste the job description here..."
              rows={8}
              className="mt-3 block w-full resize-y rounded-xl border border-slate-300 bg-white p-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-6 cursor-pointer rounded-lg bg-black px-6 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>

          {result && (
            <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-xl shadow-slate-200/50">
              {/* Header */}
              <div className="border-b border-slate-200 bg-gradient-to-r from-indigo-50 via-white to-violet-50 px-8 py-7">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-xl text-white shadow-md">
                    ✦
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      AI Resume Analysis
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Comprehensive ATS analysis powered by Gemini AI
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {/* ATS Score */}
                <div className="mb-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
                  <div className="flex flex-col items-center gap-6 sm:flex-row">
                    <div className="flex h-32 w-32 shrink-0 flex-col items-center justify-center rounded-full border-[10px] border-emerald-500 bg-white shadow-sm">
                      <span className="text-4xl font-bold text-emerald-600">
                        {result.atsScore}
                      </span>

                      <span className="text-sm font-medium text-slate-500">
                        /100
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                        ATS Score
                      </p>

                      <h4 className="mt-1 text-2xl font-bold text-slate-900">
                        <h4 className="mt-1 text-2xl font-bold text-slate-900">
                          <h4 className="mt-1 text-2xl font-bold text-slate-900">
                            {result.matchLevel || "Resume Analysis"}
                          </h4>
                        </h4>
                      </h4>

                      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                        Your resume has been compared against the job
                        description, including required skills, keywords,
                        experience, and role-specific requirements.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-5">
                    <p className="text-sm font-semibold text-indigo-600">
                      Job Match Score
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {result.jobMatchScore}/100
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      Match with the provided job description
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-500">
                      Experience Match
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {result.experienceMatch}
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 border-b border-slate-200 py-8 md:grid-cols-2">
                  <div>
                    <SectionTitle
                      icon="✓"
                      title="Matching Skills"
                      color="green"
                    />

                    <div className="mt-5 flex flex-wrap gap-2">
                      {result.matchingSkills?.map((skill, index) => (
                        <span
                          key={index}
                          className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700"
                        >
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <SectionTitle icon="×" title="Missing Skills" color="red" />

                    <div className="mt-5 flex flex-wrap gap-2">
                      {result.missingSkills?.map((skill, index) => (
                        <span
                          key={index}
                          className="rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="border-b border-slate-200 pb-8">
                  <SectionTitle icon="📄" title="Summary" color="indigo" />

                  <p className="mt-4 leading-7 text-slate-700">
                    {result.summary}
                  </p>
                </div>

                {/* Strengths + Weaknesses */}
                <div className="grid gap-0 border-b border-slate-200 md:grid-cols-2">
                  {/* Strengths */}
                  <div className="border-b border-slate-200 py-8 md:border-b-0 md:border-r md:pr-8">
                    <SectionTitle icon="✓" title="Strengths" color="green" />

                    <ul className="mt-5 space-y-3">
                      {result.strengths?.map((item, index) => (
                        <li
                          key={index}
                          className="flex gap-3 text-sm leading-6 text-slate-700"
                        >
                          <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600">
                            ✓
                          </span>

                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="py-8 md:pl-8">
                    <SectionTitle icon="!" title="Weaknesses" color="amber" />

                    <ul className="mt-5 space-y-3">
                      {result.weaknesses?.map((item, index) => (
                        <li
                          key={index}
                          className="flex gap-3 text-sm leading-6 text-slate-700"
                        >
                          <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-600">
                            !
                          </span>

                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Skills + Missing Keywords */}
                <div className="grid gap-0 border-b border-slate-200 md:grid-cols-2">
                  {/* Skills */}
                  <div className="border-b border-slate-200 py-8 md:border-b-0 md:border-r md:pr-8">
                    <SectionTitle
                      icon="</>"
                      title="Skills Detected"
                      color="blue"
                    />

                    <div className="mt-5 flex flex-wrap gap-2">
                      {result.skills?.map((skill, index) => (
                        <span
                          key={index}
                          className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  <div className="py-8 md:pl-8">
                    <SectionTitle
                      icon="×"
                      title="Missing Keywords"
                      color="red"
                    />

                    <ul className="mt-5 space-y-2">
                      {result.missingKeywords?.map((item, index) => (
                        <li key={index}>
                          <span className="inline-block rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Improvements */}
                <div className="pt-8">
                  <SectionTitle icon="💡" title="Improvements" color="violet" />

                  <ul className="mt-5 space-y-3">
                    {result.improvements?.map((item, index) => (
                      <li
                        key={index}
                        className="flex gap-3 text-sm leading-6 text-slate-700"
                      >
                        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-600">
                          {index + 1}
                        </span>

                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Job Match */}
                <div className="border-b border-slate-200 py-8">
                  <SectionTitle icon="🎯" title="Job Match" color="indigo" />

                  <div className="mt-5 rounded-xl bg-indigo-50 p-5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">
                        Match Level
                      </span>

                      <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
                        {result.matchLevel}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      This score reflects how closely your resume matches the
                      requirements and keywords in the provided job description.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function SectionTitle({
  icon,
  title,
  color,
}: {
  icon: string;
  title: string;
  color: "indigo" | "green" | "amber" | "blue" | "red" | "violet";
}) {
  const styles = {
    indigo: {
      box: "bg-indigo-100",
      icon: "text-indigo-600",
      title: "text-indigo-700",
    },
    green: {
      box: "bg-emerald-100",
      icon: "text-emerald-600",
      title: "text-emerald-700",
    },
    amber: {
      box: "bg-amber-100",
      icon: "text-amber-600",
      title: "text-amber-700",
    },
    blue: {
      box: "bg-blue-100",
      icon: "text-blue-600",
      title: "text-blue-700",
    },
    red: {
      box: "bg-red-100",
      icon: "text-red-600",
      title: "text-red-700",
    },
    violet: {
      box: "bg-violet-100",
      icon: "text-violet-600",
      title: "text-violet-700",
    },
  };

  const style = styles[color];

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${style.box} ${style.icon}`}
      >
        {icon}
      </div>

      <h4 className={`text-xl font-bold ${style.title}`}>{title}</h4>
    </div>
  );
}
