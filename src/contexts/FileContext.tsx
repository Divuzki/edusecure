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
  const { user, userRole, getAuthHeaders } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const fetchFiles = async () => {
    if (!user) return;

    try {
      // Get authentication headers
      const headers = getAuthHeaders();

      let query = supabase.from("files").select("*");

      // Apply role-based filtering
      if (userRole === "student") {
        // Students can only see their own files
        query = query.eq("owner_id", user.id);
      } else if (userRole === "teacher") {
        // Teachers can see their files and files from their students
        // This is a simplified approach - in a real app, you'd join with a classes/enrollments table
        query = query.or(`owner_id.eq.${user.id},owner_role.eq.student`);
      }
      // Admins can see all files, so no additional filtering needed

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

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
    } catch (error: any) {
      toast.error(error.message || "Error fetching files");
    }
  };

  const fetchShareLinks = async () => {
    if (!user) return;

    try {
      // Get authentication headers
      const headers = getAuthHeaders();

      // Only fetch share links for files the user owns
      const { data, error } = await supabase
        .from("share_links")
        .select("*, files(owner_id)")
        .eq("files.owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Filter out expired links
      const validLinks = data.filter(
        (link) => new Date(link.expires_at) > new Date()
      );

      setShareLinks(validLinks);
    } catch (error: any) {
      toast.error(error.message || "Error fetching share links");
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
      // Get authentication headers
      const headers = getAuthHeaders();

      // Create a unique path for the file
      const fileExt = fileName.split(".").pop();
      const filePath = `${user.id}/${Date.now()}-${fileName}`;

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("files")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          onUploadProgress: (progress) => {
            const progressPercent = Math.round(
              (progress.loaded / progress.total) * 100
            );
            setUploadProgress(progressPercent);
          },
        });

      if (uploadError) throw uploadError;

      // Add file metadata to the database
      const { error: dbError } = await supabase.from("files").insert({
        name: fileName,
        size: file.size,
        type: file.type,
        path: filePath,
        owner_id: user.id,
        owner_role: userRole,
      });

      if (dbError) throw dbError;

      toast.success("File uploaded successfully");
      fetchFiles(); // Refresh the file list
    } catch (error: any) {
      toast.error(error.message || "Error uploading file");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteFile = async (fileId: string, filePath: string) => {
    try {
      // Get authentication headers
      const headers = getAuthHeaders();

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
    } catch (error: any) {
      toast.error(error.message || "Error deleting file");
    }
  };

  const createShareLink = async (fileId: string, expiryDays: number = 7) => {
    try {
      // Get authentication headers
      const headers = getAuthHeaders();

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
      });

      if (dbError) throw dbError;

      toast.success("Share link created successfully");
      fetchShareLinks(); // Refresh the share links list

      return data?.signedUrl || "";
    } catch (error: any) {
      toast.error(error.message || "Error creating share link");
      return "";
    }
  };

  const revokeShareLink = async (linkId: string) => {
    try {
      // Get authentication headers
      const headers = getAuthHeaders();

      const { error } = await supabase
        .from("share_links")
        .delete()
        .eq("id", linkId);

      if (error) throw error;

      toast.success("Share link revoked successfully");

      // Update local state
      setShareLinks(shareLinks.filter((link) => link.id !== linkId));
    } catch (error: any) {
      toast.error(error.message || "Error revoking share link");
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
