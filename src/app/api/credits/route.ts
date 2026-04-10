import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ error: "No authorization header" }, { status: 401 });
  }

  try {
    console.log("Fetching credits from API...");
    const res = await fetch("http://api.ahsanlabs.online/api/credits", {
      headers: { Authorization: authHeader },
    });

    // Check for Cloudflare tunnel error
    if (res.status === 530) {
      const text = await res.text();
      console.error("Cloudflare Tunnel Error:", text);

      // Check if it's error 1033 (tunnel error)
      if (text.includes("1033") || text.includes("tunnel_error")) {
        return NextResponse.json({
          error: "Server sedang maintenance. Silakan coba lagi dalam 1-2 jam.",
          maintenance: true,
          details: "GitHub Verification Server dalam maintenance mode karena high requests."
        }, { status: 503 });
      }

      return NextResponse.json({ error: "API temporarily unavailable", details: text }, { status: 530 });
    }

    if (!res.ok) {
      const text = await res.text();
      console.error("API error:", res.status, text);
      return NextResponse.json({ error: "API error", details: text }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching credits:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
