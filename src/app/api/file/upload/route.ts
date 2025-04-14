import { NextRequest, NextResponse } from "next/server";
import { processCsvFile } from "../../../services/fileService";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file || file.type !== "text/csv") {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  try {
    const rowCount = await processCsvFile(file);
    return NextResponse.json({ rowCount });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
  }
}