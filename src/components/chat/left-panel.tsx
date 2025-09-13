"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PanelLeft, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileUpload } from "@/components/upload/file-upload";
import { ContactList } from "@/components/contacts/contact-list";
import { Contact } from "@/hooks/use-csv-upload";

interface LeftPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  contacts: Contact[];
  isUploading: boolean;
  onFileUpload: (file: File) => Promise<void>;
  onClearContacts: () => void;
  user: any; // You can replace this with proper user type
}

export function LeftPanel({
  isOpen,
  onToggle,
  contacts,
  isUploading,
  onFileUpload,
  onClearContacts,
  user,
}: LeftPanelProps) {
  const router = useRouter();

  const handleFileUpload = async () => {
    if (!user) {
      router.push("/signin");
      return;
    }
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await onFileUpload(file);
      }
    };
    input.click();
  };

  return (
    <div
      className={cn(
        "bg-white dark:bg-neutral-800 rounded-lg shadow-sm transition-all duration-300 flex flex-col",
        isOpen ? "w-80" : "w-16",
      )}
    >
      {/* Left Sidebar Header */}
      <div className="flex items-center justify-between p-4">
        {isOpen && (
          <h2 className="font-semibold text-foreground">Connections</h2>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="h-8 w-8 cursor-pointer"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {isOpen ? "Collapse Connections" : "Expand Connections"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Left Sidebar Content */}
      <div className="flex-1 p-4 flex flex-col overflow-hidden">
        {isOpen ? (
          <div className="space-y-4 flex flex-col h-full overflow-hidden">
            {/* Upload Section */}
            {contacts.length === 0 ? (
              user ? (
                <FileUpload
                  onFileUpload={onFileUpload}
                  isUploading={isUploading}
                  className="mb-4"
                />
              ) : (
                <div className="mb-4 text-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => router.push("/signin")}
                  >
                    Sign in to upload contacts
                  </Button>
                </div>
              )
            ) : (
              <div className="mb-4 flex-shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={handleFileUpload}
                  disabled={isUploading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isUploading ? "Uploading..." : "Add More"}
                </Button>
              </div>
            )}

            {/* Contact List */}
            <div className="flex-1 min-h-0">
              <ContactList
                contacts={contacts}
                onClearContacts={onClearContacts}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 cursor-pointer"
                    onClick={handleFileUpload}
                    disabled={isUploading}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {user ? "Add Connections" : "Sign in to add connections"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  );
}