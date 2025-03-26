
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  files: File[];
  isUploading?: boolean;
  maxFiles?: number;
  accept?: string;
  maxSizeMB?: number;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesSelected,
  files,
  isUploading = false,
  maxFiles = 10,
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png",
  maxSizeMB = 50
}) => {
  const [isDragging, setIsDragging] = useState(false);
  
  // Log component props on mount and when they change
  useEffect(() => {
    console.log("FileUploader component mounted/updated with props:", {
      filesCount: files.length,
      isUploading,
      maxFiles,
      accept,
      maxSizeMB
    });
    
    if (files.length > 0) {
      console.log("Current files:", files.map(f => ({
        name: f.name,
        size: `${(f.size / 1024 / 1024).toFixed(2)} MB`,
        type: f.type
      })));
    }
  }, [files, isUploading, maxFiles, accept, maxSizeMB]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File input change event triggered");
    if (e.target.files) {
      console.log(`${e.target.files.length} files selected from input`);
      validateAndAddFiles(Array.from(e.target.files));
    }
  };
  
  const validateAndAddFiles = (newFiles: File[]) => {
    console.log(`Validating ${newFiles.length} files`);
    
    // Check if adding these files would exceed the max
    if (files.length + newFiles.length > maxFiles) {
      console.warn(`File limit exceeded: ${files.length} existing + ${newFiles.length} new > ${maxFiles} max`);
      toast.error(`You can only upload up to ${maxFiles} files`);
      return;
    }
    
    // Validate each file
    const validFiles = newFiles.filter(file => {
      console.log(`Validating file: ${file.name} (${file.size} bytes, ${file.type})`);
      
      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        console.warn(`File too large: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB > ${maxSizeMB} MB)`);
        toast.error(`File ${file.name} exceeds the maximum size of ${maxSizeMB}MB`);
        return false;
      }
      
      // Check for duplicates
      if (files.some(f => f.name === file.name)) {
        console.warn(`Duplicate file: ${file.name}`);
        toast.error(`File ${file.name} has already been added`);
        return false;
      }
      
      console.log(`File validated successfully: ${file.name}`);
      return true;
    });
    
    console.log(`${validFiles.length} of ${newFiles.length} files passed validation`);
    
    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      console.log(`Updating files array with ${validFiles.length} new files, total: ${updatedFiles.length}`);
      onFilesSelected(updatedFiles);
      toast.success(`${validFiles.length} file(s) added successfully`);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(Array.from(e.dataTransfer.files));
    }
  };
  
  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesSelected(newFiles);
    toast.info("File removed");
  };
  
  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload-input')?.click()}
      >
        <div className="text-center">
          <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">
            Drag and drop your files here, or click to browse
          </p>
          <p className="text-gray-500 text-sm mb-4">
            Supports {accept.split(',').join(', ')} (Max {maxSizeMB}MB)
          </p>
          <input
            id="file-upload-input"
            type="file"
            multiple
            accept={accept}
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <div className="flex gap-2 justify-center">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={isUploading}
              type="button"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Browse Files'
              )}
            </Button>
            
            {/* Test button for development */}
            <Button 
              variant="outline" 
              size="sm" 
              disabled={isUploading}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                // Create a mock file for testing
                const mockFile = new File(
                  [new Blob(['test content'], { type: 'text/plain' })], 
                  'test-document.pdf', 
                  { type: 'application/pdf' }
                );
                validateAndAddFiles([mockFile]);
              }}
            >
              Test Upload
            </Button>
          </div>
        </div>
      </div>
      
      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Uploaded Files ({files.length})</h3>
          <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {files.map((file, index) => (
              <li 
                key={`${file.name}-${index}`} 
                className="flex items-center justify-between p-2 bg-gray-50 rounded group hover:bg-gray-100"
              >
                <div className="flex items-center overflow-hidden">
                  <FileText className="h-4 w-4 mr-2 text-gray-500 shrink-0" />
                  <span className="text-sm truncate" title={file.name}>
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                {!isUploading && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
