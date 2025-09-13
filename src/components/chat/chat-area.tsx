"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Send, User, Bot, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Contact } from "@/hooks/use-csv-upload";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatAreaProps {
  user: any; // You can replace this with proper user type
  contacts: Contact[];
  onFileUpload: (file: File) => Promise<void>;
  messages?: Message[];
  input?: string;
  onInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (e: React.FormEvent) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function ChatArea({
  user,
  contacts,
  onFileUpload,
  messages = [],
  input = "",
  onInputChange,
  onSubmit,
  isLoading = false,
  error,
}: ChatAreaProps) {
  const router = useRouter();
  const [localMessage, setLocalMessage] = useState("");

  // Use the input from props or fall back to local state
  const currentInput = input || localMessage;
  const handleChange = onInputChange || ((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalMessage(e.target.value);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      router.push("/signin");
      return;
    }

    if (contacts.length === 0 || !currentInput.trim()) {
      return;
    }

    // Use the onSubmit prop if available
    if (onSubmit) {
      onSubmit(e);
    } else {
      // Fallback to local handling
      console.log("Submitting message:", currentInput);
      setLocalMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
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
              
              {contacts.length === 0 ? (
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
              ) : (
                <div className="w-full">
                  <div className="text-sm text-muted-foreground mb-4">
                    You have {contacts.length} contact{contacts.length !== 1 ? "s" : ""} loaded. Start chatting!
                  </div>
                  <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    💡 Try asking: "I'm expanding my logistics business into Brazil and looking for reliable partners or advisors who know the local market."
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0">
                      {message.role === "user" ? (
                        <User className="h-4 w-4 mt-0.5" />
                      ) : (
                        <Bot className="h-4 w-4 mt-0.5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </div>
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-3 bg-muted text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    <div className="text-sm">Thinking...</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="p-4 bg-neutral-50 dark:bg-neutral-700 rounded-b-lg">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Input
              placeholder={
                !user
                  ? "Sign in to start chatting..."
                  : contacts.length > 0
                    ? "Describe your business goal and ask for recommendations..."
                    : "Upload contacts to start chatting..."
              }
              value={currentInput}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              className="pr-16 bg-white dark:bg-neutral-600 border-neutral-200 dark:border-neutral-500"
              disabled={!user || contacts.length === 0 || isLoading}
            />
          </div>
          <Button
            type="submit"
            size="icon"
            className="h-10 w-10"
            disabled={!user || contacts.length === 0 || !currentInput.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}