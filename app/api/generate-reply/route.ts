import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

type ConversationMessage = {
  sender_type: "CUSTOMER" | "AI" | "HUMAN";
  content: string;
};

type Tone =
  | "Professional"
  | "Friendly"
  | "Empathetic"
  | "Concise";

type ReplyLength =
  | "Short"
  | "Medium"
  | "Detailed";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "GEMINI_API_KEY is not configured.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const messages =
      body.messages as ConversationMessage[] | undefined;

    const customerName =
      typeof body.customerName === "string"
        ? body.customerName.trim()
        : "Customer";

    // AI PREFERENCES

    const allowedTones: Tone[] = [
      "Professional",
      "Friendly",
      "Empathetic",
      "Concise",
    ];

    const allowedReplyLengths: ReplyLength[] = [
      "Short",
      "Medium",
      "Detailed",
    ];

    const tone: Tone = allowedTones.includes(
      body.tone
    )
      ? body.tone
      : "Professional";

    const replyLength: ReplyLength =
      allowedReplyLengths.includes(
        body.replyLength
      )
        ? body.replyLength
        : "Medium";

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        {
          error:
            "At least one conversation message is required.",
        },
        { status: 400 }
      );
    }

    const conversationText = messages
      .slice(-12)
      .map((message) => {
        const speaker =
          message.sender_type === "CUSTOMER"
            ? customerName
            : message.sender_type === "AI"
              ? "ReplyFlow AI"
              : "Support Agent";

        return `${speaker}: ${message.content}`;
      })
      .join("\n");

    // TONE INSTRUCTIONS

    const toneInstruction =
      tone === "Professional"
        ? "Use a professional, clear, respectful, and business-appropriate tone."
        : tone === "Friendly"
          ? "Use a warm, friendly, approachable, and conversational tone while remaining professional."
          : tone === "Empathetic"
            ? "Use a compassionate, understanding, and empathetic tone. Acknowledge the customer's feelings when appropriate."
            : "Use a concise, direct, and efficient tone. Avoid unnecessary wording while remaining polite.";

    // LENGTH INSTRUCTIONS

    const lengthInstruction =
      replyLength === "Short"
        ? "Keep the reply very short, ideally 1 short paragraph or 1-3 sentences."
        : replyLength === "Medium"
          ? "Keep the reply moderate in length, usually 1-3 short paragraphs."
          : "Provide a more detailed but still focused reply. Include useful explanation or next steps when appropriate, without unnecessary repetition.";

    // GEMINI

    const ai = new GoogleGenAI({
      apiKey,
    });

    const prompt = `
You are ReplyFlow AI, a professional customer-support reply assistant.

Generate ONE customer-facing reply to the customer's latest message.

Customer name:
${customerName}

Conversation:
${conversationText}

Selected AI preferences:

Tone:
${tone}

Tone instructions:
${toneInstruction}

Reply length:
${replyLength}

Length instructions:
${lengthInstruction}

Rules:
- Read the conversation context before replying.
- Reply specifically to the customer's latest message.
- Be helpful, polite, and natural.
- Follow the selected tone and reply length.
- Do not invent order numbers, prices, policies, refunds, discounts, delivery dates, or other facts.
- If important information is missing, politely ask for it.
- Do not mention that you are an AI unless the customer explicitly asks.
- Do not use markdown headings.
- Do not include labels such as "AI Reply", "Suggested Reply", or "Response".
- Do not explain your reasoning.
- Return ONLY the suggested customer-facing reply.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const reply = response.text?.trim();

    if (!reply) {
      return NextResponse.json(
        {
          error: "The AI did not return a reply.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reply,
    });
  } catch (error) {
    console.error(
      "Generate AI reply error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate an AI reply.",
      },
      { status: 500 }
    );
  }
}