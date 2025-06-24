import React, { createContext, useContext, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { toast } from "react-hot-toast";

interface File {
  id: string;
  name: string;
  size: number;
  type: string;
  created_at: string;
  owner_id: string;
  url: string;
  path: string;
}

interface ShareLink {
  id: string;
  file_id: string;
  url: string;
  expires_at: string;
  created_at: string;
  files?: {
    name: string;
    owner_id: string;
  };
}

interface FileContextType {
  files: File[];
  shareLinks: ShareLink[];
  uploadProgress: number;
  isUploading: boolean;
  fetchFiles: () => Promise<void>;
  fetchShareLinks: () => Promise<void>;
  uploadFile: (file: Blob, fileName: string) => Promise<void>;
  deleteFile: (fileId: string, filePath: string) => Promise<void>;
  createShareLink: (fileId: string, expiryDays: number) => Promise<string>;
  revokeShareLink: (linkId: string) => Promise<void>;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const fetchFiles = async () => {
    if (!user) return;

    try {
      // Users can only see their own files
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const filesWithUrls = await Promise.all(
        (data || []).map(async (file) => {
          const { data: urlData } = await supabase.storage
            .from("files")
            .createSignedUrl(file.path, 3600); // 1 hour expiration

          return {
            ...file,
            url: urlData?.signedUrl || "",
          };
        })
      );

      setFiles(filesWithUrls);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error fetching files";
      toast.error(errorMessage);
    }
  };

  const fetchShareLinks = async () => {
    if (!user) {
      console.log("No user found, skipping share links fetch");
      return;
    }

    try {
      console.log("Fetching share links for user:", user.id);
      
      // Only fetch share links for files the user owns
      const { data, error } = await supabase
        .from("share_links")
        .select("*, files(name, owner_id)")
        .eq("files.owner_id", user.id)
        .order("created_at", { ascending: false });

      console.log("Share links query result:", { data, error });

      if (error) {
        console.error("Error fetching share links:", error);
        throw error;
      }

      if (!data) {
        console.log("No share links data returned");
        setShareLinks([]);
        return;
      }

      // Filter out expired links
      const validLinks = data.filter(
        (link) => new Date(link.expires_at) > new Date()
      );

      console.log("Valid share links:", validLinks);
      setShareLinks(validLinks);
    } catch (error: unknown) {
      console.error("Caught error in fetchShareLinks:", error);
      const errorMessage = error instanceof Error ? error.message : "Error fetching share links";
      toast.error(errorMessage);
      setShareLinks([]); // Set empty array on error
    }
  };

  const uploadFile = async (file: Blob, fileName: string) => {
    if (!user) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds the 10MB limit");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create a unique path for the file
      const filePath = `${user.id}/${Date.now()}-${fileName}`;

      // Simulate upload progress since Supabase doesn't support onUploadProgress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev; // Stop at 90% until upload completes
          return prev + Math.random() * 15;
        });
      }, 100);

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("files")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      clearInterval(progressInterval);
      
      if (uploadError) throw uploadError;

      // Set progress to 100% after successful upload
      setUploadProgress(100);
      
      // Small delay to show 100% progress
      await new Promise(resolve => setTimeout(resolve, 200));

      // Add file metadata to the database
      const { error: dbError } = await supabase.from("files").insert({
        name: fileName,
        size: file.size,
        type: file.type,
        path: filePath,
        owner_id: user.id,
      });

      if (dbError) throw dbError;

      toast.success("File uploaded successfully");
      fetchFiles(); // Refresh the file list
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error uploading file";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteFile = async (fileId: string, filePath: string) => {
    try {
      // Delete from storage first
      const { error: storageError } = await supabase.storage
        .from("files")
        .remove([filePath]);

      if (storageError) throw storageError;

      // Then delete metadata from database
      const { error: dbError } = await supabase
        .from("files")
        .delete()
        .eq("id", fileId);

      if (dbError) throw dbError;

      // Delete any associated share links
      await supabase.from("share_links").delete().eq("file_id", fileId);

      toast.success("File deleted successfully");

      // Update local state
      setFiles(files.filter((file) => file.id !== fileId));
      setShareLinks(shareLinks.filter((link) => link.file_id !== fileId));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error deleting file";
      toast.error(errorMessage);
    }
  };

  const createShareLink = async (fileId: string, expiryDays: number = 7) => {
    try {
      // Get the file to share
      const file = files.find((f) => f.id === fileId);
      if (!file) throw new Error("File not found");

      // Calculate expiry date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiryDays);

      // Create signed URL with longer expiration
      const { data, error: urlError } = await supabase.storage
        .from("files")
        .createSignedUrl(file.path, 60 * 60 * 24 * expiryDays); // Convert days to seconds

      if (urlError) throw urlError;

      // Add share link to database
      const { error: dbError } = await supabase.from("share_links").insert({
        file_id: fileId,
        url: data?.signedUrl || "",
        expires_at: expiresAt.toISOString(),
        owner_id: user?.id,
      });

      if (dbError) throw dbError;

      toast.success("Share link created successfully");
      fetchShareLinks(); // Refresh the share links list

      return data?.signedUrl || "";
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error creating share link";
      toast.error(errorMessage);
      return "";
    }
  };

  const revokeShareLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from("share_links")
        .delete()
        .eq("id", linkId);

      if (error) throw error;

      toast.success("Share link revoked successfully");

      // Update local state
      setShareLinks(shareLinks.filter((link) => link.id !== linkId));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error revoking share link";
      toast.error(errorMessage);
    }
  };

  return (
    <FileContext.Provider
      value={{
        files,
        shareLinks,
        uploadProgress,
        isUploading,
        fetchFiles,
        fetchShareLinks,
        uploadFile,
        deleteFile,
        createShareLink,
        revokeShareLink,
      }}
    >
      {children}
    </FileContext.Provider>
  );
}

export function useFiles() {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error("useFiles must be used within a FileProvider");
  }
  return context;
}
