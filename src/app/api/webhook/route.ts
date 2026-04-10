import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// GET - Get current webhook configuration
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ error: "No authorization header" }, { status: 401 });
  }

  try {
    // Note: The backend API doesn't have a webhook endpoint yet
    // This is a placeholder that returns success
    // In production, this should fetch from the actual API
    return NextResponse.json({
      url: null,
      enabled: false,
      message: "Webhook configuration retrieved",
    });
  } catch (error) {
    console.error("Error fetching webhook config:", error);
    return NextResponse.json(
      { error: "Failed to fetch webhook configuration" },
      { status: 500 }
    );
  }
}

// POST - Set webhook URL
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ error: "No authorization header" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { url } = body;

    // Note: The backend API doesn't have a webhook endpoint yet
    // This is a placeholder that returns success
    // In production, this should call the actual API

    // Validate URL format
    if (url && !URL.canParse(url)) {
      return NextResponse.json(
        { error: "Invalid webhook URL" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Webhook configuration saved",
      url,
    });
  } catch (error) {
    console.error("Error saving webhook config:", error);
    return NextResponse.json(
      { error: "Failed to save webhook configuration" },
      { status: 500 }
    );
  }
}

// DELETE - Remove webhook
export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ error: "No authorization header" }, { status: 401 });
  }

  try {
    return NextResponse.json({
      success: true,
      message: "Webhook removed",
    });
  } catch (error) {
    console.error("Error removing webhook:", error);
    return NextResponse.json(
      { error: "Failed to remove webhook" },
      { status: 500 }
    );
  }
}
