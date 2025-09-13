import { NextRequest, NextResponse } from "next/server";
import { createAzure } from "@ai-sdk/azure";
import { streamText } from "ai";
import { z } from "zod";

// Request schema validation
const ChatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ),
  contacts: z.array(
    z.object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      company: z.string(),
      position: z.string(),
      url: z.string(),
      emailAddress: z.string(),
      connectedOn: z.string(),
    })
  ).optional(),
  userGoal: z.string().optional(),
});

// Initialize Azure OpenAI
function getAzureAI() {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-10-21";

  if (!apiKey || !endpoint) {
    throw new Error("Azure OpenAI configuration is missing");
  }

  return createAzure({
    apiKey,
    baseURL: `${endpoint}/openai/deployments`,
    apiVersion,
  });
}

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are an AI assistant specialized in helping business professionals activate their weak ties and find relevant connections for specific business goals.

Your role is to:
1. Understand the user's business goals and context
2. Analyze their LinkedIn connections to identify relevant contacts
3. Provide intelligent recommendations on who to reach out to
4. Help craft appropriate outreach strategies

Key principles:
- Be concise and actionable in your responses
- Focus on practical networking advice
- Consider geographic, industry, and role relevance
- Suggest specific reasons why each connection might be valuable
- Maintain a professional and helpful tone

When the user shares their goal, analyze their contacts and provide specific recommendations with clear reasoning.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request first, before initializing Azure AI
    const validation = ChatRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request format",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { messages, contacts, userGoal } = validation.data;

    // Initialize Azure AI only after successful validation
    const azure = getAzureAI();

    // Prepare context about user's contacts if available
    let contactContext = "";
    if (contacts && contacts.length > 0) {
      contactContext = `

User's LinkedIn Connections (${contacts.length} total):
${contacts.map((contact, index) => 
  `${index + 1}. ${contact.firstName} ${contact.lastName}
   Company: ${contact.company}
   Position: ${contact.position}
   Connected: ${contact.connectedOn}
   URL: ${contact.url}`
).join('\n\n')}`;
    }

    // Add user goal context if available
    let goalContext = "";
    if (userGoal) {
      goalContext = `\n\nUser's Current Goal: ${userGoal}`;
    }

    // Prepare enhanced system message with context
    const enhancedSystemPrompt = SYSTEM_PROMPT + contactContext + goalContext;

    // Convert messages to the format expected by the AI SDK
    const coreMessages = messages.map(msg => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    // Stream the AI response
    const result = await streamText({
      model: azure("gpt-4o"), // Using gpt-4o as mentioned in your docs
      system: enhancedSystemPrompt,
      messages: coreMessages,
      temperature: 0.7,
    });

    // Return streaming response
    return result.toTextStreamResponse();

  } catch (error) {
    console.error("Error in AI chat API:", error);

    // Handle specific Azure OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes("Azure OpenAI configuration")) {
        return NextResponse.json(
          { error: "AI service configuration error" },
          { status: 500 }
        );
      }

      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "AI service rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }

      if (error.message.includes("authentication")) {
        return NextResponse.json(
          { error: "AI service authentication failed" },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: "An unexpected error occurred while processing your request" },
      { status: 500 }
    );
  }
}

// Export type for the API response
export type ChatApiResponse = {
  error?: string;
  details?: any;
};