"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, User, Trash2 } from "lucide-react";
import { ContactCard } from "./contact-card";
import { cn } from "@/lib/utils";
import type { Contact } from "@/hooks/use-csv-upload";

interface ContactListProps {
  contacts: Contact[];
  onClearContacts: () => void;
  className?: string;
}

export function ContactList({
  contacts,
  onClearContacts,
  className,
}: ContactListProps) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <User className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="font-medium text-foreground mb-2">Still no contacts</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Drag and drop a CSV file here or click the upload button to import
          contacts
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header with count and clear button */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {contacts.length} contacts
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClearContacts}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          title="Clear All Contacts"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Contact List with ScrollArea */}
      <ScrollArea className="flex-1 min-h-0 w-full rounded-md border">
        <div className="space-y-2 p-2">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={cn(
                "p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors",
                "group relative",
              )}
              onClick={() => setSelectedContact(contact)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Name */}
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm text-foreground truncate">
                      {contact.firstName} {contact.lastName}
                    </h4>
                    {!contact.firstName && !contact.lastName && (
                      <span className="text-xs text-muted-foreground italic">
                        (No Name)
                      </span>
                    )}
                  </div>

                  {/* Company */}
                  {contact.company && (
                    <div className="flex items-center gap-1.5">
                      <Building className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-muted-foreground truncate">
                        {contact.company}
                      </span>
                    </div>
                  )}

                  {/* Position */}
                  {contact.position && (
                    <div className="mt-1">
                      <span className="text-xs text-muted-foreground/80 truncate block">
                        {contact.position}
                      </span>
                    </div>
                  )}
                </div>

                {/* Hover indicator */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
              </div>

              {/* Email preview */}
              {contact.emailAddress && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <span className="text-xs text-muted-foreground truncate block">
                    {contact.emailAddress}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Contact Detail Modal */}
      {selectedContact && (
        <ContactCard
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
        />
      )}
    </div>
  );
}
