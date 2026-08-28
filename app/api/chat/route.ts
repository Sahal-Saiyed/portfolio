import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { knowledgeBase } from './knowledge';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey =
      process.env.GROQ_API_KEY ||
      (globalThis as any).process?.env?.GROQ_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing GROQ_API_KEY environment variable" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const groq = createGroq({
      apiKey: apiKey,
    });

    const result = streamText({
      model: groq('qwen/qwen3.6-27b'),
      system: knowledgeBase,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Chat API route error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
