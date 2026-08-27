import { Client, Receiver } from "@upstash/qstash";

const QSTASH_TOKEN = process.env.QSTASH_TOKEN || "";
const QSTASH_CURRENT_SIGNING_KEY = process.env.QSTASH_CURRENT_SIGNING_KEY || "";
const QSTASH_NEXT_SIGNING_KEY = process.env.QSTASH_NEXT_SIGNING_KEY || "";

export const qstashClient = QSTASH_TOKEN
  ? new Client({ token: QSTASH_TOKEN })
  : null;

export const qstashReceiver =
  QSTASH_CURRENT_SIGNING_KEY && QSTASH_NEXT_SIGNING_KEY
    ? new Receiver({
        currentSigningKey: QSTASH_CURRENT_SIGNING_KEY,
        nextSigningKey: QSTASH_NEXT_SIGNING_KEY,
      })
    : null;

export interface SchedulePublishPayload {
  postId: string;
  orderItemId?: string;
  socialAccountId: string;
  imageUrl: string;
  caption: string;
  scheduledAt: number; // Unix timestamp in seconds
}

/**
 * Dispatches delayed message to Upstash QStash or simulates queue locally
 */
export async function scheduleSocialPostToQStash(
  targetWebhookUrl: string,
  payload: SchedulePublishPayload
): Promise<{ messageId: string; simulated?: boolean }> {
  const now = Math.floor(Date.now() / 1000);
  const delay = Math.max(0, payload.scheduledAt - now);

  if (qstashClient) {
    const res = await qstashClient.publishJSON({
      url: targetWebhookUrl,
      body: payload,
      delay, // Delay in seconds
      headers: {
        "content-type": "application/json",
      },
    });

    return { messageId: res.messageId };
  }

  // Simulated queue for local dev / demo mode
  const mockMessageId = `mock_qs_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  console.log(`[QStash Simulated] Scheduled post ${payload.postId} in ${delay}s to ${targetWebhookUrl}`);

  return { messageId: mockMessageId, simulated: true };
}
