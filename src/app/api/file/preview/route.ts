import { NextResponse } from "next/server";
import { previewData } from "../../../services/fileService";

export async function GET() {
  try {
    const rows = await previewData(50);

    const jsonResponse = JSON.stringify({ rows });
    return new Response(jsonResponse, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Preview Failed:", error);
    return NextResponse.json(
      { error: "Failed to preview data", details: error.message },
      { status: 400 }
    );
  }
}
