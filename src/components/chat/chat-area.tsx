"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Send } from "lucide-react";
import Link from "next/link";
import { Contact } from "@/hooks/use-csv-upload";

interface ChatAreaProps {
  user: any; // You can replace this with proper user type
  contacts: Contact[];
  onFileUpload: (file: File) => Promise<void>;
  onMessageSubmit?: (message: string) => void;
}

export function ChatArea({
  user,
  contacts,
  onFileUpload,
  onMessageSubmit,
}: ChatAreaProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!user) {
      router.push("/signin");
      return;
    }

    if (contacts.length === 0 || !message.trim()) {
      return;
    }

    // Handle actual message submission
    if (onMessageSubmit) {
      onMessageSubmit(message);
    }
    
    // Clear the message after submission
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileUploadClick = async () => {
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
    <div className="flex-1 flex flex-col bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
      {/* Chat Header */}
      <div className="p-4 bg-neutral-50 dark:bg-neutral-700 rounded-t-lg">
        <h1 className="text-lg font-semibold text-foreground">Chat</h1>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="flex flex-col items-center text-center max-w-md">
          {user ? (
            <div className="text-sm text-center justify-center my-4">
              Welcome back,{" "}
              <span className="font-semibold dark:text-sky-400 text-sky-500">
                {user.email}
              </span>
              !
            </div>
          ) : (
            <div className="text-sm text-center justify-center my-4">
              <Link
                href="/signin"
                className="text-sm underline dark:text-sky-400 text-sky-500 font-semibold"
              >
                Sign in
              </Link>{" "}
              to save focus history and tasks.
            </div>
          )}
          
          {contacts.length === 0 && (
            <>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Add a source to get started
              </h2>
              <Button
                variant="secondary"
                className="mb-8"
                onClick={handleFileUploadClick}
              >
                {user ? "Upload a source" : "Sign in to upload"}
              </Button>
            </>
          )}

          {/* Here you can add the actual chat messages when they exist */}
          {contacts.length > 0 && (
            <div className="w-full">
              {/* This is where chat messages would be displayed */}
              <div className="text-sm text-muted-foreground mb-4">
                You have {contacts.length} contact{contacts.length !== 1 ? "s" : ""} loaded. Start chatting!
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-4 bg-neutral-50 dark:bg-neutral-700 rounded-b-lg">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Input
              placeholder={
                !user
                  ? "Sign in to start chatting..."
                  : contacts.length > 0
                    ? "Start chatting..."
                    : "Upload contacts to start chatting..."
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-16 bg-white dark:bg-neutral-600 border-neutral-200 dark:border-neutral-500"
              disabled={!user || contacts.length === 0}
            />
          </div>
          <Button
            size="icon"
            className="h-10 w-10"
            onClick={handleSubmit}
            disabled={!user || contacts.length === 0 || !message.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}