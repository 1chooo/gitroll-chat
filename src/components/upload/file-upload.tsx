"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { FileText, Upload, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  className?: string;
}

export function FileUpload({
  onFileUpload,
  isUploading,
  className,
}: FileUploadProps) {
  const [dragError, setDragError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      setDragError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors?.[0]?.code === "file-invalid-type") {
          setDragError("Only CSV files are accepted");
        } else {
          setDragError("Format error with the file");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        try {
          await onFileUpload(file);
        } catch (error) {
          console.error("Upload error:", error);
        }
      }
    },
    [onFileUpload],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "text/csv": [".csv"],
        "application/csv": [".csv"],
      },
      maxFiles: 1,
      disabled: isUploading,
    });

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all duration-200",
          "hover:border-primary/50 hover:bg-primary/5",
          isDragActive && !isDragReject && "border-primary bg-primary/10",
          isDragReject && "border-destructive bg-destructive/10",
          isUploading && "opacity-50 cursor-not-allowed",
          "focus:outline-none focus:ring-2 focus:ring-primary/20",
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center text-center">
          {isUploading ? (
            <>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
                <Upload className="h-6 w-6 text-primary animate-bounce" />
              </div>
              <p className="text-sm font-medium text-foreground mb-2">
                Uploading...
              </p>
              <p className="text-xs text-muted-foreground">
                Please wait while your file is being uploaded
              </p>
            </>
          ) : isDragActive ? (
            isDragReject ? (
              <>
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <p className="text-sm font-medium text-destructive mb-2">
                  Unaccepted file type
                </p>
                <p className="text-xs text-muted-foreground">
                  Please upload CSV files only
                </p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground mb-2">
                  Drag & drop to upload files
                </p>
                <p className="text-xs text-muted-foreground">
                  Support CSV files only
                </p>
              </>
            )
          ) : (
            <>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground mb-2">
                Drag & Drop your CSV file here
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                or click to select a file
              </p>
              <Button variant="secondary" size="sm" disabled={isUploading}>
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV
              </Button>
            </>
          )}
        </div>

        {dragError && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{dragError}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
