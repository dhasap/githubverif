import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ error: "No authorization header" }, { status: 401 });
  }

  try {
    const res = await fetch("http://api.ahsanlabs.online/api/apikey/revoke", {
      method: "POST",
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
    console.error("Error revoking API key:", error);
    return NextResponse.json(
      { error: "Failed to revoke API key", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
