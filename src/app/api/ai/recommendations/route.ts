import { NextRequest, NextResponse } from "next/server";
import { createAzure } from "@ai-sdk/azure";
import { generateObject } from "ai";
import { z } from "zod";

// Request schema validation
const RecommendationRequestSchema = z.object({
  userGoal: z.string().min(10, "Goal must be at least 10 characters"),
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
  ).min(1, "At least one contact is required"),
  maxRecommendations: z.number().min(1).max(10).default(5),
});

// Response schema for structured recommendations
const RecommendationSchema = z.object({
  recommendations: z.array(
    z.object({
      contactId: z.string(),
      name: z.string(),
      company: z.string(),
      position: z.string(),
      relevanceScore: z.number().min(0).max(100),
      reasons: z.array(z.string()),
      suggestedApproach: z.string(),
      keyTopics: z.array(z.string()),
    })
  ),
  summary: z.object({
    totalContacts: z.number(),
    recommendedContacts: z.number(),
    primaryIndustries: z.array(z.string()),
    geographicRelevance: z.string(),
  }),
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

// Generate the system prompt for recommendations
function generateRecommendationPrompt(userGoal: string, contacts: any[], maxRecommendations: number) {
  return `You are an expert business networking advisor specializing in analyzing LinkedIn connections to find the most relevant people for specific business goals.

USER'S GOAL: ${userGoal}

CONTACTS TO ANALYZE (${contacts.length} total):
${contacts.map((contact, index) => 
  `${index + 1}. ${contact.firstName} ${contact.lastName}
   Company: ${contact.company}
   Position: ${contact.position}
   Connected: ${contact.connectedOn}`
).join('\n\n')}

TASK: Analyze these contacts and recommend the top ${maxRecommendations} most relevant people for the user's goal.

EVALUATION CRITERIA:
1. Industry relevance (does their company/role relate to the goal?)
2. Geographic relevance (are they in the target location or have relevant experience?)
3. Seniority/influence (can they make decisions or provide valuable insights?)
4. Network potential (might they know other relevant people?)
5. Expertise alignment (do they have skills/experience relevant to the goal?)

FOR EACH RECOMMENDATION:
- Assign a relevance score (0-100, where 100 is perfect match)
- Provide 2-4 specific reasons why they're relevant
- Suggest an approach for reaching out (be specific and personalized)
- Identify 2-3 key topics to discuss with them

REQUIREMENTS:
- Only recommend contacts with relevance score ≥ 30
- Rank by relevance score (highest first)
- Provide realistic and actionable advice
- Consider cultural and professional contexts
- Be specific about why each person is valuable for this particular goal`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request first, before initializing Azure AI
    const validation = RecommendationRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request format",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { userGoal, contacts, maxRecommendations } = validation.data;

    // Initialize Azure AI only after successful validation
    const azure = getAzureAI();

    // Generate the recommendation prompt
    const prompt = generateRecommendationPrompt(userGoal, contacts, maxRecommendations);

    // Use structured generation to get recommendations
    const result = await generateObject({
      model: azure("gpt-4o"),
      prompt,
      schema: RecommendationSchema,
      temperature: 0.3, // Lower temperature for more consistent recommendations
    });

    // Validate and enhance the results
    const recommendations = result.object;

    // Ensure contact IDs match actual contacts
    const validRecommendations = recommendations.recommendations.filter(rec => 
      contacts.some(contact => contact.id === rec.contactId)
    );

    // Sort by relevance score
    validRecommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Update summary with actual counts
    const enhancedSummary = {
      ...recommendations.summary,
      totalContacts: contacts.length,
      recommendedContacts: validRecommendations.length,
    };

    return NextResponse.json({
      recommendations: validRecommendations,
      summary: enhancedSummary,
      metadata: {
        userGoal,
        analysisDate: new Date().toISOString(),
        requestedCount: maxRecommendations,
        actualCount: validRecommendations.length,
      },
    });

  } catch (error) {
    console.error("Error in AI recommendations API:", error);

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
      { error: "An unexpected error occurred while generating recommendations" },
      { status: 500 }
    );
  }
}

// Export types for the API response
export type RecommendationApiResponse = {
  recommendations: Array<{
    contactId: string;
    name: string;
    company: string;
    position: string;
    relevanceScore: number;
    reasons: string[];
    suggestedApproach: string;
    keyTopics: string[];
  }>;
  summary: {
    totalContacts: number;
    recommendedContacts: number;
    primaryIndustries: string[];
    geographicRelevance: string;
  };
  metadata: {
    userGoal: string;
    analysisDate: string;
    requestedCount: number;
    actualCount: number;
  };
};

export type RecommendationApiError = {
  error: string;
  details?: any;
};