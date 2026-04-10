import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ error: "No authorization header" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: "No webhook URL provided" },
        { status: 400 }
      );
    }

    // Validate URL
    if (!URL.canParse(url)) {
      return NextResponse.json(
        { error: "Invalid webhook URL" },
        { status: 400 }
      );
    }

    // Send test webhook payload
    const testPayload = {
      event: "webhook.test",
      message: "This is a test webhook from DevPack",
      timestamp: new Date().toISOString(),
      data: {
        test: true,
        user_id: "test_user_123",
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Source": "devpack",
        "X-Webhook-Event": "webhook.test",
      },
      body: JSON.stringify(testPayload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Webhook test failed:", res.status, text);
      return NextResponse.json(
        { error: `Webhook returned ${res.status}: ${text.slice(0, 200)}` },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Test webhook sent successfully",
      status: res.status,
    });
  } catch (error) {
    console.error("Error testing webhook:", error);
    return NextResponse.json(
      {
        error: "Failed to send test webhook",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
