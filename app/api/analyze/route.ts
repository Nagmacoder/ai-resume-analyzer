import { NextResponse } from "next/server";
import { getPath } from "pdf-parse/worker";
import { PDFParse } from "pdf-parse";

PDFParse.setWorker(getPath());

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No resume uploaded" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const parser = new PDFParse({ data: buffer });

    const result = await parser.getText();

    await parser.destroy();

    return NextResponse.json({
      success: true,
      fileName: file.name,
      text: result.text,
    });
  } catch (error) {
    console.error("Resume analysis error:", error);

    return NextResponse.json(
      { error: "Failed to process resume" },
      { status: 500 }
    );
  }
}