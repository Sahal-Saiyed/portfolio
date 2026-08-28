export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { question, context } = await req.json();

    const webhookUrl =
      process.env.DISCORD_WEBHOOK_URL ||
      (globalThis as any).process?.env?.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      console.warn("No Discord Webhook URL found in environment.");
      return new Response(JSON.stringify({ error: "Webhook not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `**🚨 Unanswered Question Logged!**\n**Question:** ${question || "Unknown inquiry"}\n**Context:** ${context || "Logged from conversation"}`,
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Failed to send webhook in /api/log-question:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
