import { describe, it, expect, beforeAll } from "vitest";
import { NextRequest } from "next/server";

// Mock data for testing
const mockContacts = [
  {
    id: "1",
    firstName: "Maria",
    lastName: "Santos",
    company: "DHL Brazil",
    position: "Operations Director",
    url: "https://linkedin.com/in/maria-santos",
    emailAddress: "maria.santos@dhl.com",
    connectedOn: "2023-01-15",
  },
  {
    id: "2",
    firstName: "Joaquim",
    lastName: "Oliveira",
    company: "Startup Brasil",
    position: "Logistics Consultant",
    url: "https://linkedin.com/in/joaquim-oliveira",
    emailAddress: "joaquim@startupbrasil.com",
    connectedOn: "2022-06-20",
  },
];

// Test helper to create mock NextRequest
function createMockRequest(body: any): NextRequest {
  const url = "http://localhost:3000/api/test";
  const request = new NextRequest(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  
  return request;
}

// Check if environment variables are set for AI testing
const isAIConfigured = () => {
  return (
    process.env.AZURE_OPENAI_API_KEY &&
    process.env.AZURE_OPENAI_ENDPOINT
  );
};

describe("AI API Request Validation", () => {
  beforeAll(() => {
    if (!isAIConfigured()) {
      console.warn("Azure OpenAI not configured - only testing request validation");
    }
  });

  describe("Chat API Request Format", () => {
    it("should reject empty messages array", async () => {
      const { POST } = await import("../../app/api/ai/chat/route");
      const request = createMockRequest({
        messages: [], // Empty messages array
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toHaveProperty("error");
    });

    it("should reject invalid message role", async () => {
      const { POST } = await import("../../app/api/ai/chat/route");
      const request = createMockRequest({
        messages: [
          {
            role: "invalid_role", // Invalid role
            content: "Hello",
          },
        ],
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toHaveProperty("error");
      expect(data.error).toBe("Invalid request format");
    });
  });

  describe("Recommendations API Request Format", () => {
    it("should reject short user goal", async () => {
      const { POST } = await import("../../app/api/ai/recommendations/route");
      const request = createMockRequest({
        userGoal: "Short", // Too short
        contacts: mockContacts,
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toHaveProperty("error");
    });

    it("should require at least one contact", async () => {
      const { POST } = await import("../../app/api/ai/recommendations/route");
      const request = createMockRequest({
        userGoal: "Expand my business to Brazil and find local partners",
        contacts: [], // Empty contacts
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toHaveProperty("error");
    });
  });

  describe("Message Generation API Request Format", () => {
    it("should reject short user goal", async () => {
      const { POST } = await import("../../app/api/ai/generate-message/route");
      const request = createMockRequest({
        contact: mockContacts[0],
        userGoal: "Short", // Too short
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toHaveProperty("error");
    });

    it("should validate contact format", async () => {
      const { POST } = await import("../../app/api/ai/generate-message/route");
      const request = createMockRequest({
        contact: {
          id: "1",
          // Missing required fields
        },
        userGoal: "Expand my business to Brazil",
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toHaveProperty("error");
    });
  });

  describe("Error Handling", () => {
    it("should handle missing Azure OpenAI configuration gracefully", async () => {
      // Temporarily clear environment variables
      const originalKey = process.env.AZURE_OPENAI_API_KEY;
      const originalEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
      
      delete process.env.AZURE_OPENAI_API_KEY;
      delete process.env.AZURE_OPENAI_ENDPOINT;

      const { POST } = await import("../../app/api/ai/chat/route");
      const request = createMockRequest({
        messages: [{ role: "user", content: "Hello" }],
      });

      const response = await POST(request);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toBe("AI service configuration error");

      // Restore environment variables
      if (originalKey) process.env.AZURE_OPENAI_API_KEY = originalKey;
      if (originalEndpoint) process.env.AZURE_OPENAI_ENDPOINT = originalEndpoint;
    });
  });
});