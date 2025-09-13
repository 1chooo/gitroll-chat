"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  PanelLeft,
  PanelRight,
  Plus,
  Upload,
  Send,
  FileText,
  BarChart3,
  Video,
  Brain,
  FileSpreadsheet,
  HelpCircle,
  Edit3,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuthContext } from "@/context/auth-context";
import EmailVerification from "@/components/auth/email-verification";
import { useCSVUpload } from "@/hooks/use-csv-upload";
import { FileUpload } from "@/components/upload/file-upload";
import { ContactList } from "@/components/contacts/contact-list";
import { Toaster } from "sonner";

export default function Chat() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true); // Default to open for better UX
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [message, setMessage] = useState("");

  // CSV upload functionality
  const { contacts, isUploading, uploadCSV, clearContacts } = useCSVUpload();

  const isEmailVerified = user?.emailVerified || false;

  const handleSubmit = () => {
    if (!user) {
      router.push("/signin");
      return;
    }

    if (!isEmailVerified) {
      // Show email verification component or redirect
      return;
    }

    // Handle actual message submission here
    console.log("Submitting message:", message);
  };

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
      <div
        className={cn(
          "bg-white dark:bg-neutral-800 rounded-lg shadow-sm transition-all duration-300 flex flex-col",
          leftSidebarOpen ? "w-80" : "w-16",
        )}
      >
        {/* Left Sidebar Header */}
        <div className="flex items-center justify-between p-4">
          {leftSidebarOpen && (
            <h2 className="font-semibold text-foreground">Connections</h2>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                  className="h-8 w-8 cursor-pointer"
                >
                  <PanelLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {leftSidebarOpen
                    ? "Collapse Connections"
                    : "Expand Connections"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Left Sidebar Content */}
        <div className="flex-1 p-4 flex flex-col overflow-hidden">
          {leftSidebarOpen ? (
            <div className="space-y-4 flex flex-col h-full overflow-hidden">
              {/* Upload Section */}
              {contacts.length === 0 ? (
                user ? (
                  <FileUpload
                    onFileUpload={uploadCSV}
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
                    onClick={() => {
                      if (!user) {
                        router.push("/signin");
                        return;
                      }
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = ".csv";
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          uploadCSV(file);
                        }
                      };
                      input.click();
                    }}
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
                  onClearContacts={clearContacts}
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
                      onClick={() => {
                        if (!user) {
                          router.push("/signin");
                          return;
                        }
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = ".csv";
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement)
                            .files?.[0];
                          if (file) {
                            uploadCSV(file);
                          }
                        };
                        input.click();
                      }}
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

      {/* Main Chat Area */}
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
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Add a source to get started
            </h2>
            <Button
              variant="secondary"
              className="mb-8"
              onClick={() => {
                if (!user) {
                  router.push("/signin");
                  return;
                }
                // Handle file upload for signed-in users
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".csv";
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    uploadCSV(file);
                  }
                };
                input.click();
              }}
            >
              {user ? "Upload a source" : "Sign in to upload"}
            </Button>
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

      {/* Right Sidebar */}
      <div
        className={cn(
          "bg-white dark:bg-neutral-800 rounded-lg shadow-sm transition-all duration-300 flex flex-col",
          rightSidebarOpen ? "w-80" : "w-16",
        )}
      >
        {/* Right Sidebar Header */}
        <div className="flex items-center justify-between p-4">
          {rightSidebarOpen && (
            <h2 className="font-semibold text-foreground">Profile</h2>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                  className="h-8 w-8 cursor-pointer"
                >
                  <PanelRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {rightSidebarOpen ? "Collapse Profile" : "Expand Profile"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Right Sidebar Content */}
        <div className="flex-1 p-4">
          {rightSidebarOpen ? (
            <div className="space-y-6">
              {/* Studio Tools Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="flex flex-col items-center p-4 rounded-lg bg-neutral-50 dark:bg-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-600 cursor-pointer transition-colors"
                  onClick={() => !user && router.push("/signin")}
                >
                  <BarChart3 className="h-6 w-6 text-muted-foreground mb-2" />
                  <span className="text-sm text-center text-muted-foreground">
                    Audio Overview
                  </span>
                </div>
                <div
                  className="flex flex-col items-center p-4 rounded-lg bg-neutral-50 dark:bg-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-600 cursor-pointer transition-colors"
                  onClick={() => !user && router.push("/signin")}
                >
                  <Video className="h-6 w-6 text-muted-foreground mb-2" />
                  <span className="text-sm text-center text-muted-foreground">
                    Video Overview
                  </span>
                </div>
                <div
                  className="flex flex-col items-center p-4 rounded-lg bg-neutral-50 dark:bg-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-600 cursor-pointer transition-colors"
                  onClick={() => !user && router.push("/signin")}
                >
                  <Brain className="h-6 w-6 text-muted-foreground mb-2" />
                  <span className="text-sm text-center text-muted-foreground">
                    Mind Map
                  </span>
                </div>
                <div
                  className="flex flex-col items-center p-4 rounded-lg bg-neutral-50 dark:bg-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-600 cursor-pointer transition-colors"
                  onClick={() => !user && router.push("/signin")}
                >
                  <FileSpreadsheet className="h-6 w-6 text-muted-foreground mb-2" />
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-center text-muted-foreground">
                      Reports
                    </span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
                <div
                  className="flex flex-col items-center p-4 rounded-lg bg-neutral-50 dark:bg-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-600 cursor-pointer transition-colors"
                  onClick={() => !user && router.push("/signin")}
                >
                  <FileText className="h-6 w-6 text-muted-foreground mb-2" />
                  <span className="text-sm text-center text-muted-foreground">
                    Flashcards
                  </span>
                </div>
                <div
                  className="flex flex-col items-center p-4 rounded-lg bg-neutral-50 dark:bg-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-600 cursor-pointer transition-colors"
                  onClick={() => !user && router.push("/signin")}
                >
                  <HelpCircle className="h-6 w-6 text-muted-foreground mb-2" />
                  <span className="text-sm text-center text-muted-foreground">
                    Quiz
                  </span>
                </div>
              </div>

              {/* Studio Output Section */}
              <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-6 mt-6">
                <div className="flex flex-col items-center text-center py-8">
                  <Edit3 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium text-foreground mb-2">
                    Studio output will be saved here.
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    After adding sources, click to add Audio Overview, Study
                    Guide, Mind Map, and more!
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => !user && router.push("/signin")}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Add note
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <PanelRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Brain className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <FileSpreadsheet className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <FileText className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster position="bottom-right" />
    </div>
  );
}
