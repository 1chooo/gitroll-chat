"use client";

import { useState } from "react";
import { useAuthContext } from "@/context/auth-context";
import EmailVerification from "@/components/auth/email-verification";
import { useCSVUpload } from "@/hooks/use-csv-upload";
import { useChatAI } from "@/hooks/use-ai-chat";
import { Toaster } from "sonner";
import { LeftPanel } from "@/components/chat/left-panel";
import { RightPanel } from "@/components/chat/right-panel";
import { ChatArea } from "@/components/chat/chat-area";

export default function Chat() {
  const { user, loading } = useAuthContext();
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true); // Default to open for better UX
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  // CSV upload functionality
  const { contacts, isUploading, uploadCSV, clearContacts } = useCSVUpload();

  // Chat AI functionality
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: isChatLoading,
    error: chatError,
  } = useChatAI({ contacts });

  const isEmailVerified = user?.emailVerified || false;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // Show email verification overlay if user is logged in but not verified
  if (user && !isEmailVerified) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4">
        <EmailVerification />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-neutral-50 dark:bg-neutral-900 text-foreground gap-2 p-2">
      {/* Left Sidebar */}
      <LeftPanel
        isOpen={leftSidebarOpen}
        onToggle={() => setLeftSidebarOpen(!leftSidebarOpen)}
        contacts={contacts}
        isUploading={isUploading}
        onFileUpload={uploadCSV}
        onClearContacts={clearContacts}
        user={user}
      />

      {/* Main Chat Area */}
      <ChatArea
        user={user}
        contacts={contacts}
        onFileUpload={uploadCSV}
        messages={messages}
        input={input}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        isLoading={isChatLoading}
        error={chatError}
      />

      {/* Right Sidebar */}
      <RightPanel
        isOpen={rightSidebarOpen}
        onToggle={() => setRightSidebarOpen(!rightSidebarOpen)}
        user={user}
      />

      {/* Toast notifications */}
      <Toaster position="bottom-right" />
    </div>
  );
}
