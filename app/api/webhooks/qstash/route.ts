import { NextRequest, NextResponse } from "next/server";
import { qstashReceiver } from "@/lib/qstash";
import { executePublishPost } from "@/actions/social";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    // Verify QStash signature if keys are provided
    if (qstashReceiver) {
      const signature = req.headers.get("upstash-signature");
      if (!signature) {
        return NextResponse.json({ error: "Missing Upstash signature" }, { status: 401 });
      }

      const isValid = await qstashReceiver.verify({
        signature,
        body: rawBody,
        url: req.url,
      });

      if (!isValid) {
        return NextResponse.json({ error: "Invalid Upstash signature" }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const { postId } = payload;

    if (!postId) {
      return NextResponse.json({ error: "Missing postId in payload" }, { status: 400 });
    }

    console.log(`[QStash Webhook Triggered] Executing publish for post: ${postId}`);
    const result = await executePublishPost(postId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, postId });
  } catch (err: any) {
    console.error("QStash webhook error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
