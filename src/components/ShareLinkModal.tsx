import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareLink: string;
}

const ShareLinkModal: React.FC<ShareLinkModalProps> = ({ isOpen, onClose, shareLink }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 animate-slide-up">
        <h3 className="text-lg font-medium mb-4">Share File</h3>
        
        <p className="text-sm text-gray-600 mb-4">
          This link will expire in 7 days. Anyone with this link can access the file.
        </p>
        
        <div className="flex">
          <input
            type="text"
            value={shareLink}
            readOnly
            className="input flex-grow"
          />
          <button
            onClick={copyToClipboard}
            className="ml-2 px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
          >
            {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
          </button>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="btn btn-primary"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareLinkModal;