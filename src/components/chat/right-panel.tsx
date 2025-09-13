"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  PanelRight,
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

interface RightPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  user: any; // You can replace this with proper user type
}

export function RightPanel({ isOpen, onToggle, user }: RightPanelProps) {
  const router = useRouter();

  const handleToolClick = () => {
    if (!user) {
      router.push("/signin");
    }
    // Add specific tool functionality here
  };

  const studioTools = [
    {
      icon: BarChart3,
      label: "Audio Overview",
      onClick: handleToolClick,
    },
    {
      icon: Video,
      label: "Video Overview",
      onClick: handleToolClick,
    },
    {
      icon: Brain,
      label: "Mind Map",
      onClick: handleToolClick,
    },
    {
      icon: FileSpreadsheet,
      label: "Reports",
      onClick: handleToolClick,
      hasDropdown: true,
    },
    {
      icon: FileText,
      label: "Flashcards",
      onClick: handleToolClick,
    },
    {
      icon: HelpCircle,
      label: "Quiz",
      onClick: handleToolClick,
    },
  ];

  return (
    <div
      className={cn(
        "bg-white dark:bg-neutral-800 rounded-lg shadow-sm transition-all duration-300 flex flex-col",
        isOpen ? "w-80" : "w-16",
      )}
    >
      {/* Right Sidebar Header */}
      <div className="flex items-center justify-between p-4">
        {isOpen && (
          <h2 className="font-semibold text-foreground">Profile</h2>
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
                <PanelRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isOpen ? "Collapse Profile" : "Expand Profile"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Right Sidebar Content */}
      <div className="flex-1 p-4">
        {isOpen ? (
          <div className="space-y-6">
            {/* Studio Tools Grid */}
            <div className="grid grid-cols-2 gap-3">
              {studioTools.map((tool, index) => {
                const IconComponent = tool.icon;
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center p-4 rounded-lg bg-neutral-50 dark:bg-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-600 cursor-pointer transition-colors"
                    onClick={tool.onClick}
                  >
                    <IconComponent className="h-6 w-6 text-muted-foreground mb-2" />
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-center text-muted-foreground">
                        {tool.label}
                      </span>
                      {tool.hasDropdown && (
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                );
              })}
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
                  onClick={handleToolClick}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Add note
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {studioTools.map((tool, index) => {
              const IconComponent = tool.icon;
              return (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={tool.onClick}
                      >
                        <IconComponent className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{tool.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}