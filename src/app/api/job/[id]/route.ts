import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = request.headers.get("authorization");
  const { id } = await params;

  if (!authHeader) {
    return NextResponse.json({ error: "No authorization header" }, { status: 401 });
  }

  try {
    console.log("Fetching job:", id);
    const res = await fetch(`http://api.ahsanlabs.online/api/job/${id}`, {
      headers: { Authorization: authHeader },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("API error:", res.status, text);
      return NextResponse.json({ error: "API error", details: text }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { error: "Failed to fetch job", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
