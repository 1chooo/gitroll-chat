import { renderHook, act } from "@testing-library/react";
import { describe, it, beforeEach, expect, vi } from "vitest";
import { useCSVUpload } from "../use-csv-upload";
import { toast } from "sonner";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(),
  },
}));

// Mock papaparse
const mockParse = vi.fn();
vi.mock("papaparse", () => ({
  parse: mockParse,
}));

describe("useCSVUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle CSV with missing fields gracefully", async () => {
    const { result } = renderHook(() => useCSVUpload());

    // Mock CSV data with missing fields (similar to LinkedIn export)
    const mockCSVData = [
      {
        firstName: "Bin",
        lastName: "Fan",
        url: "https://www.linkedin.com/in/bin-fan",
        emailAddress: "", // Missing email
        company: "Alluxio, Inc.",
        position: "VP, Open Source",
        connectedOn: "03 Jun 2025",
      },
      {
        firstName: "John",
        lastName: "Doe",
        url: "https://linkedin.com/in/johndoe",
        emailAddress: "", // Missing email
        company: "Tech Corp",
        position: "Software Engineer",
        connectedOn: "2024-01-15",
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        url: "https://linkedin.com/in/janesmith",
        emailAddress: "jane.smith@startup.com",
        company: "StartupXYZ",
        position: "", // Missing position
        connectedOn: "2024-02-20",
      },
      {
        firstName: "",
        lastName: "Wilson",
        url: "https://linkedin.com/in/wilson",
        emailAddress: "",
        company: "Wilson Consulting",
        position: "CEO",
        connectedOn: "",
      },
      {
        firstName: "Alex",
        lastName: "",
        url: "https://linkedin.com/in/alexchen",
        emailAddress: "alex.chen@designer.com",
        company: "Creative Studio",
        position: "UI/UX Designer",
        connectedOn: "2024-02-28",
      },
      {
        firstName: "",
        lastName: "",
        url: "",
        emailAddress: "",
        company: "Financial Group",
        position: "Data Analyst",
        connectedOn: "2024-03-15",
      },
      {
        firstName: "",
        lastName: "",
        url: "",
        emailAddress: "",
        company: "",
        position: "",
        connectedOn: "",
      },
    ];

    // Mock Papa.parse to call complete callback with our test data
    mockParse.mockImplementation((input: any, config: any) => {
      config.complete({
        data: mockCSVData,
      });
    });

    const mockFile = new File([""], "test.csv", { type: "text/csv" });

    await act(async () => {
      await result.current.uploadCSV(mockFile);
    });

    // Should have processed 6 valid contacts (skipping the completely empty row)
    expect(result.current.contacts).toHaveLength(6);

    // Verify contacts with missing data are still included
    const contacts = result.current.contacts;

    // First contact (missing email)
    expect(contacts[0]).toEqual(
      expect.objectContaining({
        firstName: "Bin",
        lastName: "Fan",
        emailAddress: "",
        company: "Alluxio, Inc.",
      }),
    );

    // Contact with missing position
    expect(contacts[2]).toEqual(
      expect.objectContaining({
        firstName: "Jane",
        lastName: "Smith",
        position: "",
        company: "StartupXYZ",
      }),
    );

    // Contact with only company (should be included)
    expect(contacts[5]).toEqual(
      expect.objectContaining({
        firstName: "",
        lastName: "",
        company: "Financial Group",
      }),
    );

    // Success toast should be called
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining("Successfully imported 6 contacts"),
      expect.any(Object),
    );
  });

  it("should handle completely empty rows", async () => {
    const { result } = renderHook(() => useCSVUpload());

    const mockCSVData = [
      {
        firstName: "",
        lastName: "",
        url: "",
        emailAddress: "",
        company: "",
        position: "",
        connectedOn: "",
      },
      {
        firstName: "John",
        lastName: "Doe",
        url: "https://linkedin.com/in/johndoe",
        emailAddress: "john@example.com",
        company: "Tech Corp",
        position: "Software Engineer",
        connectedOn: "2024-01-15",
      },
    ];

    mockParse.mockImplementation((input: any, config: any) => {
      config.complete({
        data: mockCSVData,
      });
    });

    const mockFile = new File([""], "test.csv", { type: "text/csv" });

    await act(async () => {
      await result.current.uploadCSV(mockFile);
    });

    // Should only have 1 valid contact (empty row should be skipped)
    expect(result.current.contacts).toHaveLength(1);
    expect(result.current.contacts[0].firstName).toBe("John");
  });

  it("should handle null and undefined values", async () => {
    const { result } = renderHook(() => useCSVUpload());

    const mockCSVData = [
      {
        firstName: null,
        lastName: undefined,
        url: "N/A",
        emailAddress: null,
        company: "Tech Corp",
        position: undefined,
        connectedOn: "null",
      },
    ];

    mockParse.mockImplementation((input: any, config: any) => {
      config.complete({
        data: mockCSVData,
      });
    });

    const mockFile = new File([""], "test.csv", { type: "text/csv" });

    await act(async () => {
      await result.current.uploadCSV(mockFile);
    });

    expect(result.current.contacts).toHaveLength(1);
    expect(result.current.contacts[0]).toEqual(
      expect.objectContaining({
        firstName: "",
        lastName: "",
        url: "",
        emailAddress: "",
        company: "Tech Corp",
        position: "",
        connectedOn: "",
      }),
    );
  });

  it("should show error when no valid contacts found", async () => {
    const { result } = renderHook(() => useCSVUpload());

    const mockCSVData = [
      {
        firstName: "",
        lastName: "",
        url: "",
        emailAddress: "",
        company: "",
        position: "",
        connectedOn: "",
      },
    ];

    mockParse.mockImplementation((input: any, config: any) => {
      config.complete({
        data: mockCSVData,
      });
    });

    const mockFile = new File([""], "test.csv", { type: "text/csv" });

    await act(async () => {
      await result.current.uploadCSV(mockFile);
    });

    expect(result.current.contacts).toHaveLength(0);
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("No valid contacts found"),
      expect.any(Object),
    );
  });

  it("should handle LinkedIn CSV with notes and metadata at the beginning", async () => {
    const { result } = renderHook(() => useCSVUpload());

    // Mock file.text() to return LinkedIn format with notes
    const mockCSVContent = `Notes:
"When exporting your connection data, you may notice that some of the email addresses are missing."

Additional metadata line

First Name,Last Name,URL,Email Address,Company,Position,Connected On
Bin,Fan,https://www.linkedin.com/in/bin-fan,,"Alluxio, Inc.","VP, Open Source",03 Jun 2025
John,Doe,https://linkedin.com/in/johndoe,,Tech Corp,Software Engineer,2024-01-15`;

    const mockCSVData = [
      {
        firstName: "Bin",
        lastName: "Fan",
        url: "https://www.linkedin.com/in/bin-fan",
        emailAddress: "",
        company: "Alluxio, Inc.",
        position: "VP, Open Source",
        connectedOn: "03 Jun 2025",
      },
      {
        firstName: "John",
        lastName: "Doe",
        url: "https://linkedin.com/in/johndoe",
        emailAddress: "",
        company: "Tech Corp",
        position: "Software Engineer",
        connectedOn: "2024-01-15",
      },
    ];

    mockParse.mockImplementation((input: any, config: any) => {
      // Verify that the input has been preprocessed (should not contain "Notes:" at the beginning)
      expect(input).not.toMatch(/^Notes:/);
      expect(input).toMatch(/^First Name,Last Name/);

      config.complete({
        data: mockCSVData,
      });
    });

    // Create mock file with the CSV content
    const mockFile = new File([mockCSVContent], "linkedin.csv", {
      type: "text/csv",
    });

    // Mock the file.text() method
    vi.spyOn(mockFile, "text").mockResolvedValue(mockCSVContent);

    await act(async () => {
      await result.current.uploadCSV(mockFile);
    });

    expect(result.current.contacts).toHaveLength(2);
    expect(result.current.contacts[0].firstName).toBe("Bin");
    expect(result.current.contacts[1].firstName).toBe("John");
  });
});
