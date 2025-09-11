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
    if (!file.name.endsWith('.csv')) {
      toast.error("Please upload a CSV file");
      return;
    }

    setIsUploading(true);
    toast.loading("Processing CSV file...", { id: "csv-upload" });

    try {
      const text = await file.text();
      
      Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => {
          // Handle common header variations
          const headerMap: Record<string, string> = {
            'first name': 'firstName',
            'firstname': 'firstName',
            'first_name': 'firstName',
            'last name': 'lastName',
            'lastname': 'lastName',
            'last_name': 'lastName',
            'url': 'url',
            'website': 'url',
            'profile url': 'url',
            'email address': 'emailAddress',
            'email': 'emailAddress',
            'company': 'company',
            'organization': 'company',
            'position': 'position',
            'title': 'position',
            'job title': 'position',
            'connected on': 'connectedOn',
            'connected': 'connectedOn',
            'connection date': 'connectedOn',
          };
          
          const normalizedHeader = header.toLowerCase().trim();
          return headerMap[normalizedHeader] || header;
        },
        complete: (results) => {
          try {
            const validContacts: Contact[] = [];
            
            results.data.forEach((row: any, index: number) => {
              // Skip empty rows (require at least one of these fields)
              if (!row.firstName && !row.lastName && !row.company) {
                return;
              }

              const contact: Contact = {
                id: `contact-${Date.now()}-${index}`,
                firstName: row.firstName || '',
                lastName: row.lastName || '',
                url: row.url || '',
                emailAddress: row.emailAddress || '',
                company: row.company || '',
                position: row.position || '',
                connectedOn: row.connectedOn || '',
              };

              validContacts.push(contact);
            });

            if (validContacts.length === 0) {
              toast.error("No valid contacts found in the CSV file", { id: "csv-upload" });
              return;
            }

            setContacts(validContacts);
            toast.success(`Successfully imported ${validContacts.length} contacts`, { id: "csv-upload" });
          } catch (error) {
            console.error('Error processing CSV data:', error);
            toast.error("An error occurred while processing the CSV data", { id: "csv-upload" });
          }
        },
        error: (error: any) => {
          console.error('Error parsing CSV:', error);
          toast.error("An error occurred while parsing the CSV file", { id: "csv-upload" });
        }
      });
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error("An error occurred while reading the file", { id: "csv-upload" });
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
