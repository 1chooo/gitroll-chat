import { useState, useCallback } from "react";
import Papa from "papaparse";
import { toast } from "sonner";

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  url: string;
  emailAddress: string;
  company: string;
  position: string;
  connectedOn: string;
}

/**
 * Preprocesses CSV text to handle LinkedIn's format with notes and metadata
 * Finds the actual header row and removes any preceding content
 */
function preprocessCSVText(text: string): string {
  const lines = text.split("\n");

  // Common header patterns we expect to find in LinkedIn CSV
  const headerPatterns = [
    /first\s*name/i,
    /last\s*name/i,
    /email\s*address|email/i,
    /company|organization/i,
    /position|title|job/i,
    /connected\s*on|connected|connection/i,
    /url|profile/i,
  ];

  // Additional indicators that a line might be a header
  const headerIndicators = [
    /,/, // Contains commas (CSV structure)
    /[A-Za-z]+\s*,\s*[A-Za-z]+/, // Pattern like "Name,Email"
  ];

  // Find the line that contains the most header patterns (likely the header row)
  let headerLineIndex = -1;
  let maxScore = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip obviously non-header lines
    if (
      line.length === 0 ||
      line.startsWith('"') ||
      line.toLowerCase().includes("note")
    ) {
      continue;
    }

    let score = 0;

    // Count how many header patterns this line matches
    for (const pattern of headerPatterns) {
      if (pattern.test(line)) {
        score += 2; // Higher weight for specific header patterns
      }
    }

    // Add points for general header indicators
    for (const indicator of headerIndicators) {
      if (indicator.test(line)) {
        score += 1;
      }
    }

    // Bonus points if line contains multiple comma-separated words (typical CSV header)
    const parts = line.split(",");
    if (parts.length >= 4 && parts.every((part) => part.trim().length > 0)) {
      score += 3;
    }

    // If this line has the highest score and meets minimum threshold, it's likely our header
    if (score > maxScore && score >= 5) {
      // Require at least score of 5 to be confident
      maxScore = score;
      headerLineIndex = i;
    }
  }

  // If we found a likely header row, return CSV starting from that line
  if (headerLineIndex >= 0) {
    const relevantLines = lines.slice(headerLineIndex);
    return relevantLines.join("\n");
  }

  // If no clear header found, return original text and let Papa Parse handle it
  return text;
}

interface UseCSVUploadReturn {
  contacts: Contact[];
  isUploading: boolean;
  uploadCSV: (file: File) => Promise<void>;
  clearContacts: () => void;
}

export function useCSVUpload(): UseCSVUploadReturn {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadCSV = useCallback(async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    setIsUploading(true);
    toast.loading("Processing CSV file...", { id: "csv-upload" });

    try {
      const text = await file.text();

      // Preprocess CSV to find the actual header row and skip notes/metadata
      const preprocessedText = preprocessCSVText(text);

      Papa.parse<Record<string, string>>(preprocessedText, {
        header: true,
        skipEmptyLines: "greedy", // Skip lines that are completely empty or contain only whitespace
        dynamicTyping: false, // Keep all values as strings for consistent handling
        transformHeader: (header: string) => {
          // Handle common header variations and normalize
          const headerMap: Record<string, string> = {
            "first name": "firstName",
            firstname: "firstName",
            first_name: "firstName",
            "last name": "lastName",
            lastname: "lastName",
            last_name: "lastName",
            url: "url",
            website: "url",
            "profile url": "url",
            profile: "url",
            "linkedin url": "url",
            "email address": "emailAddress",
            email: "emailAddress",
            "e-mail": "emailAddress",
            company: "company",
            organization: "company",
            employer: "company",
            position: "position",
            title: "position",
            "job title": "position",
            role: "position",
            "connected on": "connectedOn",
            connected: "connectedOn",
            "connection date": "connectedOn",
            "date connected": "connectedOn",
          };

          const normalizedHeader = header.toLowerCase().trim();
          return headerMap[normalizedHeader] || header;
        },
        complete: (results) => {
          try {
            const validContacts: Contact[] = [];
            const skippedRows: number[] = [];

            results.data.forEach((row: any, index: number) => {
              try {
                // Helper function to safely extract and clean field values
                const getFieldValue = (field: any): string => {
                  if (field === null || field === undefined) return "";
                  const value = String(field).trim();
                  // Handle common empty value indicators
                  if (
                    value === "" ||
                    value === "null" ||
                    value === "undefined" ||
                    value === "N/A"
                  ) {
                    return "";
                  }
                  return value;
                };

                // Extract fields with better null/undefined handling
                const firstName = getFieldValue(row.firstName);
                const lastName = getFieldValue(row.lastName);
                const company = getFieldValue(row.company);
                const url = getFieldValue(row.url);
                const emailAddress = getFieldValue(row.emailAddress);
                const position = getFieldValue(row.position);
                const connectedOn = getFieldValue(row.connectedOn);

                // Skip completely empty rows or rows that don't have at least a name or company
                const hasMinimumData = firstName || lastName || company;
                if (!hasMinimumData) {
                  skippedRows.push(index + 1); // +1 for human-readable row number
                  return;
                }

                // Create contact with validated data
                const contact: Contact = {
                  id: `contact-${Date.now()}-${index}`,
                  firstName,
                  lastName,
                  url,
                  emailAddress,
                  company,
                  position,
                  connectedOn,
                };

                validContacts.push(contact);
              } catch (rowError) {
                console.error(`Error processing row ${index + 1}:`, rowError);
                skippedRows.push(index + 1);
              }
            });

            // Provide detailed feedback
            if (validContacts.length === 0) {
              if (skippedRows.length > 0) {
                toast.error(
                  `No valid contacts found. All ${skippedRows.length} rows were skipped due to missing required data.`,
                  { id: "csv-upload" },
                );
              } else {
                toast.error("No valid contacts found in the CSV file", {
                  id: "csv-upload",
                });
              }
              return;
            }

            setContacts(validContacts);

            // Success message with details
            let successMessage = `Successfully imported ${validContacts.length} contacts`;
            if (skippedRows.length > 0) {
              successMessage += ` (${skippedRows.length} rows skipped due to missing data)`;
            }
            toast.success(successMessage, { id: "csv-upload" });

            // Log details for debugging
            if (skippedRows.length > 0) {
              console.log(`Skipped rows: ${skippedRows.join(", ")}`);
            }
          } catch (error) {
            console.error("Error processing CSV data:", error);
            toast.error("An error occurred while processing the CSV data", {
              id: "csv-upload",
            });
          }
        },
        error: (error: any) => {
          console.error("Error parsing CSV:", error);
          toast.error("An error occurred while parsing the CSV file", {
            id: "csv-upload",
          });
        },
      });
    } catch (error) {
      console.error("Error reading file:", error);
      toast.error("An error occurred while reading the file", {
        id: "csv-upload",
      });
    } finally {
      setIsUploading(false);
    }
  }, []);

  const clearContacts = useCallback(() => {
    setContacts([]);
    toast.success("All contacts have been cleared");
  }, []);

  return {
    contacts,
    isUploading,
    uploadCSV,
    clearContacts,
  };
}
