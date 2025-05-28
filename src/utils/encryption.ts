import CryptoJS from 'crypto-js';

// Generate a random encryption key
export const generateEncryptionKey = (): string => {
  return CryptoJS.lib.WordArray.random(32).toString();
};

// Encrypt data with AES-256
export const encryptData = (data: string, key: string): string => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

// Decrypt data with AES-256
export const decryptData = (encryptedData: string, key: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Encrypt a file (as string or ArrayBuffer)
export const encryptFile = async (file: File): Promise<{ encryptedData: string, key: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const key = generateEncryptionKey();
    
    reader.onload = (event) => {
      if (!event.target || !event.target.result) {
        reject(new Error('Failed to read file'));
        return;
      }
      
      const fileData = event.target.result.toString();
      const encryptedData = encryptData(fileData, key);
      
      resolve({ encryptedData, key });
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

// Decrypt a file
export const decryptFile = (encryptedData: string, key: string): string => {
  return decryptData(encryptedData, key);
};

// Hash a password for secure storage
export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password).toString();
};

// Generate a secure random password
export const generateSecurePassword = (length: number = 12): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }
  
  return password;
};