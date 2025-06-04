import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFiles } from '../contexts/FileContext';
import { Upload, X } from 'lucide-react';

const FileUpload: React.FC = () => {
  const { uploadFile, uploadProgress, isUploading } = useFiles();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  const handleUpload = async () => {
    if (selectedFile) {
      await uploadFile(selectedFile, selectedFile.name);
      setSelectedFile(null);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
  };

  return (
    <div className="mb-8 w-full">
      <div className={`dropzone ${isDragActive ? 'dropzone-active' : ''} ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`} {...getRootProps()}>
        <input {...getInputProps()} disabled={isUploading} />
        <div className="flex flex-col items-center justify-center text-gray-500">
          <Upload size={48} className="mb-3 text-blue-500" />
          <p className="font-medium">Drag files here or click to browse</p>
          <p className="text-sm mt-1">Maximum file size: 10MB</p>
        </div>
      </div>

      {selectedFile && !isUploading && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200 animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-800">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={isUploading}
              >
                Upload
              </button>
              <button
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={clearSelection}
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="mt-4 animate-fade-in">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Uploading {selectedFile?.name}</span>
            <span className="text-sm font-medium text-blue-600">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;