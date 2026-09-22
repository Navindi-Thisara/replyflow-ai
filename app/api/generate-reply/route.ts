import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
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
    // --------------------------------------------------
    // ENVIRONMENT VARIABLES
    // --------------------------------------------------

    const apiKey = process.env.GEMINI_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "GEMINI_API_KEY is not configured.",
        },
        { status: 500 }
      );
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        {
          error:
            "Supabase environment variables are not configured.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // AUTHENTICATION
    // --------------------------------------------------

    const authorization = request.headers.get("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    const accessToken = authorization
      .replace("Bearer ", "")
      .trim();

    if (!accessToken) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    // Create Supabase client using the user's access token.
    // This allows Supabase RLS to apply to this request.
    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    );

    // Verify the access token.
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error(
        "Authentication error:",
        userError
      );

      return NextResponse.json(
        {
          error: "Invalid or expired session.",
        },
        { status: 401 }
      );
    }

    // --------------------------------------------------
    // BUSINESS ROLE CHECK
    // --------------------------------------------------

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) {
      console.error(
        "Profile lookup error:",
        profileError
      );

      return NextResponse.json(
        {
          error: "Unable to verify account role.",
        },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        {
          error: "Account profile not found.",
        },
        { status: 403 }
      );
    }

    if (profile.role !== "BUSINESS") {
      return NextResponse.json(
        {
          error:
            "Only business accounts can generate AI replies.",
        },
        { status: 403 }
      );
    }

    // --------------------------------------------------
    // REQUEST BODY
    // --------------------------------------------------

    const body = await request.json();

    const conversationId =
      typeof body.conversationId === "string"
        ? body.conversationId.trim()
        : "";

    if (!conversationId) {
      return NextResponse.json(
        {
          error: "Conversation ID is required.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // AI PREFERENCES
    // --------------------------------------------------

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

    // --------------------------------------------------
    // LOAD BUSINESS CONVERSATION
    // --------------------------------------------------

    const {
      data: conversation,
      error: conversationError,
    } = await supabase
      .from("conversations")
      .select(
        "id, customer_name, user_id, customer_id"
      )
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (conversationError) {
      console.error(
        "Conversation lookup error:",
        conversationError
      );

      return NextResponse.json(
        {
          error: "Unable to load conversation.",
        },
        { status: 500 }
      );
    }

    if (!conversation) {
      return NextResponse.json(
        {
          error:
            "Conversation not found or you do not have access to it.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // LOAD CONVERSATION MESSAGES
    // --------------------------------------------------

    const {
      data: messages,
      error: messagesError,
    } = await supabase
      .from("messages")
      .select(
        "id, conversation_id, sender_type, content, created_at"
      )
      .eq("conversation_id", conversationId)
      .order("created_at", {
        ascending: true,
      });

    if (messagesError) {
      console.error(
        "Messages lookup error:",
        messagesError
      );

      return NextResponse.json(
        {
          error:
            "Unable to load conversation messages.",
        },
        { status: 500 }
      );
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        {
          error:
            "At least one conversation message is required.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // BUILD CONVERSATION CONTEXT
    // --------------------------------------------------

    const conversationText = (
      messages as ConversationMessage[]
    )
      .slice(-12)
      .map((message) => {
        let speaker = "Support Agent";

        if (message.sender_type === "CUSTOMER") {
          speaker =
            conversation.customer_name ||
            "Customer";
        } else if (
          message.sender_type === "AI"
        ) {
          speaker = "ReplyFlow AI";
        } else if (
          message.sender_type === "HUMAN"
        ) {
          speaker = "Support Agent";
        }

        return `${speaker}: ${message.content}`;
      })
      .join("\n");

    // --------------------------------------------------
    // TONE INSTRUCTION
    // --------------------------------------------------

    const toneInstruction =
      tone === "Professional"
        ? "Use a professional, clear, respectful, and business-appropriate tone."
        : tone === "Friendly"
          ? "Use a warm, friendly, approachable, and conversational tone while remaining professional."
          : tone === "Empathetic"
            ? "Use a compassionate, understanding, and empathetic tone. Acknowledge the customer's feelings when appropriate."
            : "Use a concise, direct, and efficient tone. Avoid unnecessary wording while remaining polite.";

    // --------------------------------------------------
    // LENGTH INSTRUCTION
    // --------------------------------------------------

    const lengthInstruction =
      replyLength === "Short"
        ? "Keep the reply very short, ideally 1 short paragraph or 1-3 sentences."
        : replyLength === "Medium"
          ? "Keep the reply moderate in length, usually 1-3 short paragraphs."
          : "Provide a more detailed but still focused reply. Include useful explanation or next steps when appropriate, without unnecessary repetition.";

    // --------------------------------------------------
    // GEMINI AI
    // --------------------------------------------------

    const ai = new GoogleGenAI({
      apiKey,
    });

    const prompt = `
You are ReplyFlow AI, a professional customer-support reply assistant.

Generate ONE customer-facing reply to the customer's latest message.

Customer name:
${conversation.customer_name || "Customer"}

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

    const response =
      await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

    const reply = response.text?.trim();

    // --------------------------------------------------
    // VALIDATE AI RESPONSE
    // --------------------------------------------------

    if (!reply) {
      return NextResponse.json(
        {
          error:
            "The AI did not return a reply.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // RETURN GENERATED REPLY
    // --------------------------------------------------

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

