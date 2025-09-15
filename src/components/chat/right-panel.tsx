"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  PanelRight,
  Users,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RecommendedContactCard } from "@/components/contacts/recommended-contact-card";
import type { Contact } from "@/hooks/use-csv-upload";

interface RightPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  user: any; // You can replace this with proper user type
  recommendedContacts?: Contact[];
}

export function RightPanel({ isOpen, onToggle, user: _user, recommendedContacts = [] }: RightPanelProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-neutral-800 rounded-lg shadow-sm transition-all duration-300 flex flex-col",
        isOpen ? "w-80" : "w-16",
      )}
    >
      {/* Right Sidebar Header */}
      <div className="flex items-center justify-between p-4 flex-shrink-0">
        {isOpen && (
          <h2 className="font-semibold text-foreground">Recommended Profiles</h2>
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
              <p>{isOpen ? "Collapse Profiles" : "Expand Profiles"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Right Sidebar Content */}
      <div className="flex-1 p-4 flex flex-col overflow-hidden">
        {isOpen ? (
          <div className="flex flex-col h-full overflow-hidden">
            {recommendedContacts.length > 0 ? (
              /* Recommended Contacts List */
              <ScrollArea className="flex-1 min-h-0 w-full">
                <div className="space-y-3 pr-2">
                  {recommendedContacts.map((contact, index) => (
                    <RecommendedContactCard
                      key={`${contact.id}-${index}`}
                      contact={contact}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="font-medium text-foreground mb-2">Start a conversation</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ask the AI assistant about your networking goals and I'll recommend relevant contacts from your connections.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Collapsed State */
          <div className="flex flex-col items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Recommended Profiles</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  );
}