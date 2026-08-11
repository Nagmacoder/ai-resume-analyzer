"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!file) {
      alert("Please upload a PDF resume.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setResult(data.analysis);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16">
      <div className="mx-auto max-w-4xl text-center">
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

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-6 cursor-pointer rounded-lg bg-black px-6 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>

          {result && (
            <div className="mt-8 rounded-lg border bg-gray-50 p-6 text-left">
              <h3 className="mb-4 text-2xl font-semibold text-gray-900">
                AI Resume Analysis
              </h3>

              <div className="mb-6">
                <p className="text-sm text-gray-500">ATS Score</p>

                <p className="text-4xl font-bold text-gray-900">
                  {result.atsScore}/100
                </p>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold">Summary</h4>
                <p className="mt-2 text-gray-600">{result.summary}</p>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold">Strengths</h4>

                <ul className="mt-2 list-disc pl-5 text-gray-600">
                  {result.strengths?.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold">Weaknesses</h4>

                <ul className="mt-2 list-disc pl-5 text-gray-600">
                  {result.weaknesses?.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold">Skills</h4>

                <div className="mt-2 flex flex-wrap gap-2">
                  {result.skills?.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="rounded-full bg-gray-200 px-3 py-1 text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold">Missing Keywords</h4>

                <ul className="mt-2 list-disc pl-5 text-gray-600">
                  {result.missingKeywords?.map(
                    (item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ),
                  )}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold">Improvements</h4>

                <ul className="mt-2 list-disc pl-5 text-gray-600">
                  {result.improvements?.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
