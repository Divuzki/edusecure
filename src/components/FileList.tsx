import React, { useEffect, useState } from 'react';
import { useFiles } from '../contexts/FileContext';
import { useAuth } from '../contexts/AuthContext';
import { Download, Share2, Trash2, File as FileIcon, FileText, FileImage, Film, Music, Archive, FileQuestion } from 'lucide-react';
import ShareLinkModal from './ShareLinkModal';

const FileList: React.FC = () => {
  const { files, fetchFiles, deleteFile, createShareLink } = useFiles();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    const loadFiles = async () => {
      setIsLoading(true);
      await fetchFiles();
      setIsLoading(false);
    };
    
    loadFiles();
  }, [fetchFiles]);

  // Function to determine which icon to show based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <FileImage className="text-blue-500" />;
    if (fileType.startsWith('video/')) return <Film className="text-purple-500" />;
    if (fileType.startsWith('audio/')) return <Music className="text-green-500" />;
    if (fileType.includes('pdf')) return <FileText className="text-red-500" />;
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) {
      return <Archive className="text-yellow-500" />;
    }
    return <FileIcon className="text-gray-500" />;
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleShare = async (fileId: string) => {
    setSelectedFile(fileId);
    const link = await createShareLink(fileId, 7); // 7 days expiration
    setShareLink(link);
    setShareModalOpen(true);
  };

  const handleDelete = async (fileId: string, filePath: string) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      await deleteFile(fileId, filePath);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse-slow">
          <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 w-full bg-gray-200 rounded mb-2"></div>
          <div className="h-10 w-full bg-gray-200 rounded mb-2"></div>
          <div className="h-10 w-full bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-4">
          <FileQuestion size={64} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-1">No files found</h3>
        <p className="text-gray-500">Upload files to see them here</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {files.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 break-all">
                          {file.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {file.type.split('/')[1]?.toUpperCase() || file.type}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatFileSize(file.size)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(file.created_at)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <a
                        href={file.url}
                        download
                        className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-full transition-colors duration-200"
                        title="Download"
                      >
                        <Download size={18} />
                      </a>
                      
                      {file.owner_id === user?.id && (
                        <>
                          <button
                            onClick={() => handleShare(file.id)}
                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-full transition-colors duration-200"
                            title="Share"
                          >
                            <Share2 size={18} />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(file.id, file.path)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-full transition-colors duration-200"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <ShareLinkModal 
        isOpen={shareModalOpen} 
        onClose={() => setShareModalOpen(false)}
        shareLink={shareLink}
      />
    </>
  );
};

export default FileList;