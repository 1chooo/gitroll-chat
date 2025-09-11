"use client";

import { useState } from "react";
import { X, ExternalLink, Mail, Building, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Contact } from "@/hooks/use-csv-upload";

interface ContactCardProps {
  contact: Contact;
  onClose: () => void;
  className?: string;
}

export function ContactCard({ contact, onClose, className }: ContactCardProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 150); // 等待動畫完成
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm",
        "transition-opacity duration-150",
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
      onClick={handleClose}
    >
      <Card
        className={cn(
          "w-full max-w-md bg-white dark:bg-neutral-800 shadow-xl",
          "transform transition-all duration-150",
          isVisible ? "scale-100" : "scale-95"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-foreground">
                {contact.firstName} {contact.lastName}
              </CardTitle>
              {contact.position && (
                <p className="text-sm text-muted-foreground mt-1">
                  {contact.position}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 -mr-2 -mt-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Company */}
          {contact.company && (
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {contact.company}
                </p>
                <p className="text-xs text-muted-foreground">公司</p>
              </div>
            </div>
          )}

          {/* Email */}
          {contact.emailAddress && (
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground break-all">
                  {contact.emailAddress}
                </p>
                <p className="text-xs text-muted-foreground">電子郵件</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => window.open(`mailto:${contact.emailAddress}`, '_blank')}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* URL */}
          {contact.url && (
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <ExternalLink className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground break-all">
                  {contact.url}
                </p>
                <p className="text-xs text-muted-foreground">個人資料連結</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => window.open(contact.url, '_blank')}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Connected On */}
          {contact.connectedOn && (
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {contact.connectedOn}
                </p>
                <p className="text-xs text-muted-foreground">連結日期</p>
              </div>
            </div>
          )}

          {/* Full Name Badge */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800">
              <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="flex-1">
              <Badge variant="secondary" className="text-xs">
                {contact.firstName} {contact.lastName}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">完整姓名</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
