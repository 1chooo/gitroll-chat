import { NextRequest, NextResponse } from "next/server";
import { createAzure } from "@ai-sdk/azure";
import { generateObject } from "ai";
import { z } from "zod";

// Request schema validation
const MessageGenerationRequestSchema = z.object({
  contact: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    company: z.string(),
    position: z.string(),
    url: z.string(),
    emailAddress: z.string(),
    connectedOn: z.string(),
  }),
  userGoal: z.string().min(10, "Goal must be at least 10 characters"),
  messageType: z.enum(["linkedin", "email", "introduction"]).default("linkedin"),
  tone: z.enum(["professional", "friendly", "casual", "formal"]).default("professional"),
  keyTopics: z.array(z.string()).optional(),
  customContext: z.string().optional(),
});

// Response schema for structured message generation
const MessageSchema = z.object({
  subject: z.string(),
  message: z.string(),
  alternatives: z.array(z.string()),
  tips: z.array(z.string()),
  followUpSuggestions: z.array(z.string()),
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

// Generate the system prompt for message creation
function generateMessagePrompt(
  contact: any,
  userGoal: string,
  messageType: string,
  tone: string,
  keyTopics?: string[],
  customContext?: string
) {
  const connectionDate = new Date(contact.connectedOn);
  const timeConnected = Math.floor((Date.now() - connectionDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
  
  return `You are an expert business communication specialist helping craft personalized outreach messages for reactivating professional connections.

CONTACT INFORMATION:
- Name: ${contact.firstName} ${contact.lastName}
- Company: ${contact.company}
- Position: ${contact.position}
- Connected: ${contact.connectedOn} (approximately ${timeConnected} months ago)
- Profile: ${contact.url}

USER'S GOAL: ${userGoal}

MESSAGE REQUIREMENTS:
- Type: ${messageType} message
- Tone: ${tone}
- Key Topics: ${keyTopics?.join(", ") || "Not specified"}
- Additional Context: ${customContext || "None provided"}

GUIDELINES FOR ${messageType.toUpperCase()} MESSAGES:

${messageType === "linkedin" ? `
LinkedIn Message Guidelines:
- Keep it under 300 characters for initial message
- Be conversational and authentic
- Reference shared connection history
- Clear, specific ask
- Professional but warm tone
` : messageType === "email" ? `
Email Guidelines:
- Professional subject line
- Proper email structure (greeting, body, closing)
- 150-250 words for body
- Clear value proposition
- Specific call-to-action
` : `
Introduction Guidelines:
- Assume someone is introducing you
- Brief background context
- Clear reason for connection
- Mutual benefit focus
- Easy next steps
`}

PERSONALIZATION REQUIREMENTS:
1. Reference your existing LinkedIn connection
2. Acknowledge the time gap since you last connected
3. Be specific about why you're reaching out to THEM specifically
4. Connect their expertise/role to your goal
5. Offer mutual value, not just ask for help
6. Suggest a specific, low-commitment next step

TONE REQUIREMENTS FOR "${tone}":
${tone === "professional" ? "Business-focused, respectful, competent" :
  tone === "friendly" ? "Warm, approachable, personable but still professional" :
  tone === "casual" ? "Relaxed, conversational, authentic" :
  "Formal, respectful, traditional business language"}

CREATE:
1. A compelling subject line (for email) or opening (for LinkedIn)
2. A main message that follows all guidelines
3. 2-3 alternative message versions with different approaches
4. 3-5 practical tips for sending this message
5. 2-3 follow-up suggestions if they respond positively

Focus on quality over quantity. Make it feel personal and authentic, not templated.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request first, before initializing Azure AI
    const validation = MessageGenerationRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request format",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { contact, userGoal, messageType, tone, keyTopics, customContext } = validation.data;

    // Initialize Azure AI only after successful validation
    const azure = getAzureAI();

    // Generate the message prompt
    const prompt = generateMessagePrompt(contact, userGoal, messageType, tone, keyTopics, customContext);

    // Use structured generation to get message
    const result = await generateObject({
      model: azure("gpt-4o"),
      prompt,
      schema: MessageSchema,
      temperature: 0.7, // Moderate creativity for varied but consistent messages
    });

    const messageData = result.object;

    // Enhance the response with additional metadata
    const response = {
      ...messageData,
      metadata: {
        contact: {
          name: `${contact.firstName} ${contact.lastName}`,
          company: contact.company,
          position: contact.position,
        },
        messageType,
        tone,
        userGoal,
        generatedAt: new Date().toISOString(),
        keyTopics: keyTopics || [],
      },
      analytics: {
        estimatedLength: messageData.message.length,
        wordCount: messageData.message.split(/\s+/).length,
        readingTime: Math.ceil(messageData.message.split(/\s+/).length / 200), // minutes
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error in AI message generation API:", error);

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
      { error: "An unexpected error occurred while generating the message" },
      { status: 500 }
    );
  }
}

// Export types for the API response
export type MessageGenerationApiResponse = {
  subject: string;
  message: string;
  alternatives: string[];
  tips: string[];
  followUpSuggestions: string[];
  metadata: {
    contact: {
      name: string;
      company: string;
      position: string;
    };
    messageType: string;
    tone: string;
    userGoal: string;
    generatedAt: string;
    keyTopics: string[];
  };
  analytics: {
    estimatedLength: number;
    wordCount: number;
    readingTime: number;
  };
};

export type MessageGenerationApiError = {
  error: string;
  details?: any;
};