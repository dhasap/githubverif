import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ error: "No authorization header" }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log("Starting verification...");

    const res = await fetch("http://api.ahsanlabs.online/api/verify", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("API error:", res.status, text);
      return NextResponse.json({ error: "API error", details: text }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error starting verification:", error);
    return NextResponse.json(
      { error: "Failed to start verification", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
