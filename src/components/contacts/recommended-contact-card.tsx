"use client";

import { ExternalLink, Building, User, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Contact } from "@/hooks/use-csv-upload";

interface RecommendedContactCardProps {
  contact: Contact;
  className?: string;
}

export function RecommendedContactCard({ 
  contact, 
  className 
}: RecommendedContactCardProps) {
  const handleReconnect = () => {
    if (contact.url) {
      window.open(contact.url, "_blank");
    }
  };

  const handleEmail = () => {
    if (contact.emailAddress) {
      window.open(`mailto:${contact.emailAddress}`, "_blank");
    }
  };

  return (
    <Card className={cn("w-full max-w-md bg-white dark:bg-neutral-800 shadow-sm hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-semibold text-foreground">
              {contact.firstName} {contact.lastName}
            </CardTitle>
            {contact.position && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {contact.position}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 px-3 pb-3">
        {/* Company */}
        {contact.company && (
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-5 h-5 rounded bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
              <Building className="h-2.5 w-2.5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground">
                {contact.company}
              </p>
            </div>
          </div>
        )}

        {/* Contact Info Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center justify-center w-4 h-4 rounded bg-gray-100 dark:bg-gray-800 flex-shrink-0">
              <User className="h-2.5 w-2.5 text-gray-600 dark:text-gray-400" />
            </div>
            <span className="text-xs text-muted-foreground">Recommended</span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {contact.emailAddress && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleEmail}
                title="Send Email"
              >
                <Mail className="h-2.5 w-2.5" />
              </Button>
            )}
            
            {contact.url && (
              <Button
                variant="default"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={handleReconnect}
              >
                <ExternalLink className="h-2.5 w-2.5 mr-1" />
                Reconnect
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}