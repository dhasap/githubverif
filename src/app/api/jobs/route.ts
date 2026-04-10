import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ error: "No authorization header" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit") || "10";
  const offset = searchParams.get("offset") || "0";

  try {
    console.log("Fetching jobs...");
    const res = await fetch(
      `http://api.ahsanlabs.online/api/jobs?limit=${limit}&offset=${offset}`,
      {
        headers: { Authorization: authHeader },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("API error:", res.status, text);
      return NextResponse.json({ error: "API error", details: text }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
