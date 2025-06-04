import React, { useEffect, useState } from 'react';
import { useFiles } from '../contexts/FileContext';
import { Copy, X, Check } from 'lucide-react';

const ShareLinksList: React.FC = () => {
  const { shareLinks, fetchShareLinks, revokeShareLink } = useFiles();
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const loadShareLinks = async () => {
      setIsLoading(true);
      await fetchShareLinks();
      setIsLoading(false);
    };
    
    loadShareLinks();
  }, [fetchShareLinks]);

  const copyToClipboard = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };
  
  const calculateDaysLeft = (expiresAt: string): number => {
    const expiryDate = new Date(expiresAt);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-pulse-slow">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-12 w-full bg-gray-200 rounded mb-2"></div>
          <div className="h-12 w-full bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (shareLinks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">You haven't shared any files yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">Active Share Links</h3>
      </div>
      <ul className="divide-y divide-gray-200">
        {shareLinks.map((link) => (
          <li key={link.id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-800 truncate">
                  {link.files?.name || 'File'}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-gray-500 mr-3">
                    Created: {formatDate(link.created_at)}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    calculateDaysLeft(link.expires_at) <= 1 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    Expires in {calculateDaysLeft(link.expires_at)} days
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => copyToClipboard(link.id, link.url)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  title="Copy link"
                >
                  {copiedId === link.id ? 
                    <Check size={18} className="text-green-600" /> : 
                    <Copy size={18} />
                  }
                </button>
                <button
                  onClick={() => revokeShareLink(link.id)}
                  className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-full transition-colors duration-200"
                  title="Revoke link"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ShareLinksList;