import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, UsersRound, FileText, BarChart4, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

interface StorageStats {
  totalFiles: number;
  totalSize: number;
  filesByType: Record<string, number>;
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [storageStats, setStorageStats] = useState<StorageStats>({
    totalFiles: 0,
    totalSize: 0,
    filesByType: {},
  });
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchStorageStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error: any) {
      toast.error(error.message || 'Error fetching users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchStorageStats = async () => {
    try {
      // Get file stats
      const { data: files, error: filesError } = await supabase
        .from('files')
        .select('*');
        
      if (filesError) throw filesError;
      
      // Calculate stats
      const totalFiles = files?.length || 0;
      const totalSize = files?.reduce((sum, file) => sum + (file.size || 0), 0) || 0;
      
      // Group by file type
      const filesByType: Record<string, number> = {};
      files?.forEach((file) => {
        const type = file.type?.split('/')[1] || 'unknown';
        filesByType[type] = (filesByType[type] || 0) + 1;
      });
      
      setStorageStats({
        totalFiles,
        totalSize,
        filesByType,
      });
    } catch (error: any) {
      toast.error(error.message || 'Error fetching storage statistics');
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This will also delete all their files.')) {
      return;
    }
    
    try {
      // Delete user's files from storage first
      const { data: userFiles } = await supabase
        .from('files')
        .select('path')
        .eq('owner_id', userId);
        
      if (userFiles && userFiles.length > 0) {
        const filePaths = userFiles.map(file => file.path);
        await supabase.storage.from('files').remove(filePaths);
      }
      
      // Delete user's share links
      await supabase
        .from('share_links')
        .delete()
        .eq('owner_id', userId);
        
      // Delete user's files metadata
      await supabase
        .from('files')
        .delete()
        .eq('owner_id', userId);
        
      // Delete user's profile
      await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
        
      // Delete the user from auth
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      
      toast.success('User deleted successfully');
      
      // Update the users list
      setUsers(users.filter(user => user.id !== userId));
    } catch (error: any) {
      toast.error(error.message || 'Error deleting user');
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Manage users and system statistics
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <UsersRound size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              {isLoadingUsers ? (
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FileText size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Files</p>
              {isLoadingStats ? (
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-2xl font-semibold text-gray-900">{storageStats.totalFiles}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <BarChart4 size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Storage Used</p>
              {isLoadingStats ? (
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-2xl font-semibold text-gray-900">{formatFileSize(storageStats.totalSize)}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">User Management</h3>
        </div>
        
        {isLoadingUsers ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-200 rounded w-full"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No users found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : user.role === 'teacher'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 flex items-center"
                      >
                        <Trash2 size={16} className="mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!isLoadingStats && (
        <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">File Type Distribution</h3>
          </div>
          <div className="p-6">
            {Object.keys(storageStats.filesByType).length === 0 ? (
              <p className="text-gray-500 text-center">No files available</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(storageStats.filesByType).map(([type, count]) => (
                  <div key={type} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium capitalize">{type}</span>
                      <span className="text-blue-600 font-semibold">{count} files</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(count / storageStats.totalFiles) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;