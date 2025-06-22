import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';
import ShareLinksList from '../components/ShareLinksList';
import { Database, Share } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { userRole } = useAuth();
  const [activeTab, setActiveTab] = useState('files');

  return (
    <div className="animate-fade-in">
      <header className="mb-8 hidden">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Dashboard</h1>
        <p className="text-gray-600">
          {userRole === 'student' && "Manage your documents, assignments, and shared files."}
          {userRole === 'teacher' && "Manage your teaching materials and student submissions."}
          {userRole === 'admin' && "Access and manage all files in the system."}
        </p>
      </header>

      <div className="mb-6">
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">Select a tab</label>
          <select
            id="tabs"
            name="tabs"
            className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            defaultValue={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <option value="files">My Files</option>
            <option value="shared">Shared Links</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('files')}
                className={`${
                  activeTab === 'files'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Database size={18} className="mr-2" />
                My Files
              </button>
              <button
                onClick={() => setActiveTab('shared')}
                className={`${
                  activeTab === 'shared'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Share size={18} className="mr-2" />
                Shared Links
              </button>
            </nav>
          </div>
        </div>
      </div>

      {activeTab === 'files' && (
        <div className="space-y-6">
          <FileUpload />
          <FileList />
        </div>
      )}

      {activeTab === 'shared' && (
        <div className="space-y-6">
          <ShareLinksList />
        </div>
      )}
    </div>
  );
};

export default Dashboard;