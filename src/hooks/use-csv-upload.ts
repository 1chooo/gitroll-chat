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
      toast.error("請上傳 CSV 格式的檔案");
      return;
    }

    setIsUploading(true);
    toast.loading("正在處理 CSV 檔案...", { id: "csv-upload" });

    try {
      const text = await file.text();
      
      Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => {
          // 處理常見的標題格式
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
              // 檢查必要的欄位
              if (!row.firstName && !row.lastName && !row.company) {
                return; // 跳過空的行
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
              toast.error("CSV 檔案中沒有找到有效的聯絡人資料", { id: "csv-upload" });
              return;
            }

            setContacts(validContacts);
            toast.success(`成功導入 ${validContacts.length} 位聯絡人`, { id: "csv-upload" });
          } catch (error) {
            console.error('Error processing CSV data:', error);
            toast.error("處理 CSV 資料時發生錯誤", { id: "csv-upload" });
          }
        },
        error: (error: any) => {
          console.error('Error parsing CSV:', error);
          toast.error("解析 CSV 檔案時發生錯誤", { id: "csv-upload" });
        }
      });
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error("讀取檔案時發生錯誤", { id: "csv-upload" });
    } finally {
      setIsUploading(false);
    }
  }, []);

  const clearContacts = useCallback(() => {
    setContacts([]);
    toast.success("已清除所有聯絡人");
  }, []);

  return {
    contacts,
    isUploading,
    uploadCSV,
    clearContacts,
  };
}
