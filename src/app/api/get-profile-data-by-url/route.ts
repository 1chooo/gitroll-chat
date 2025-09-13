import { NextRequest, NextResponse } from "next/server";
import {
  LinkedInProfileSchema,
  LinkedInProfileRequestSchema,
  type LinkedInProfile,
} from "@/schema/linkedin-profile";

export async function GET(request: NextRequest) {
  try {
    // Parse and validate the query parameters
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");

    // Validate the request
    const validationResult = LinkedInProfileRequestSchema.safeParse({ url });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request parameters",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    // Check for required environment variables
    const rapidApiKey = process.env.RAPIDAPI_KEY;
    const rapidApiHost =
      process.env.RAPIDAPI_HOST || "li-data-scraper.p.rapidapi.com";

    if (!rapidApiKey) {
      console.error("RAPIDAPI_KEY environment variable is not set");
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 },
      );
    }

    // Encode the LinkedIn URL for the API request
    const encodedUrl = encodeURIComponent(validationResult.data.url);
    const apiUrl = `https://${rapidApiHost}/get-profile-data-by-url?url=${encodedUrl}`;

    // Make the request to RapidAPI
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": rapidApiKey,
        "X-RapidAPI-Host": rapidApiHost,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        `RapidAPI request failed: ${response.status} ${response.statusText}`,
      );

      // Handle specific error cases
      if (response.status === 401) {
        return NextResponse.json(
          { error: "API authentication failed" },
          { status: 401 },
        );
      }

      if (response.status === 429) {
        return NextResponse.json(
          { error: "API rate limit exceeded" },
          { status: 429 },
        );
      }

      if (response.status === 404) {
        return NextResponse.json(
          { error: "LinkedIn profile not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(
        { error: "Failed to fetch profile data" },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Pre-process the data to handle common issues
    const processedData = {
      ...data,
      // Ensure optional booleans have default values
      isOpenToWork: data.isOpenToWork ?? false,
      isHiring: data.isHiring ?? false,

      // Handle undefined/null optional fields
      languages: data.languages ?? null,
      skills: data.skills ?? null,
      givenRecommendation: data.givenRecommendation ?? null,
      givenRecommendationCount: data.givenRecommendationCount ?? 0,
      receivedRecommendation: data.receivedRecommendation ?? null,
      receivedRecommendationCount: data.receivedRecommendationCount ?? 0,
      courses: data.courses ?? null,
      certifications: data.certifications ?? null,
      honors: data.honors ?? null,
      volunteering: data.volunteering ?? null,

      // Handle projects object
      projects: data.projects
        ? {
            total: data.projects.total ?? 0,
            items: data.projects.items ?? null,
          }
        : { total: 0, items: null },

      // Handle positions with potentially invalid URLs
      position:
        data.position?.map((pos: any) => ({
          ...pos,
          companyLogo:
            pos.companyLogo && isValidUrl(pos.companyLogo)
              ? pos.companyLogo
              : "",
        })) ?? [],

      fullPositions:
        data.fullPositions?.map((pos: any) => ({
          ...pos,
          companyLogo:
            pos.companyLogo && isValidUrl(pos.companyLogo)
              ? pos.companyLogo
              : "",
        })) ?? [],
    };

    // Helper function to validate URLs
    function isValidUrl(string: string): boolean {
      try {
        new URL(string);
        return true;
      } catch {
        return false;
      }
    }

    // Validate the response from the API
    const profileValidation = LinkedInProfileSchema.safeParse(processedData);

    if (!profileValidation.success) {
      console.error(
        "Invalid response from LinkedIn API:",
        profileValidation.error.issues,
      );
      
      // Log the actual data structure for debugging
      console.log("Actual data structure:", JSON.stringify(processedData, null, 2));
      
      // For now, return a partial response to help with debugging
      return NextResponse.json(
        {
          error: "Validation failed",
          details: profileValidation.error.issues,
          rawData: processedData, // Include raw data for debugging
        },
        { status: 502 },
      );
    }

    // Return the validated profile data
    return NextResponse.json(profileValidation.data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Unexpected error in LinkedIn profile API:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Type for the API response
export type LinkedInProfileApiResponse = LinkedInProfile;

// Error response type
export type LinkedInProfileApiError = {
  error: string;
  details?: Array<{
    code: string;
    expected?: string;
    received?: string;
    path: (string | number)[];
    message: string;
  }>;
};
