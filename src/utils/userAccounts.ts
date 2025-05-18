// Utility to handle user accounts from environment variables or local JSON file
import { parse } from 'json5'; // More forgiving JSON parser

interface UserAccount {
  password: string;
  isDefaultPassword?: boolean;
  // Add other user properties as needed
}

interface UserAccounts {
  [username: string]: UserAccount;
}

// API response interfaces
interface AuthResponse {
  success: boolean;
  isDefaultPassword?: boolean;
  message?: string;
}

interface ApiUser {
  id: number;
  username: string;
  is_default_password: boolean;
}

interface ApiAuthResponse {
  message: string;
  user: ApiUser;
}

interface ApiPasswordUpdateResponse {
  message: string;
}

// Get the authentication mode from environment variables
const getAuthMode = (): 'api' | 'local' => {
  return (process.env.AUTH_MODE || 'api') as 'api' | 'local';
};

// Get the API base URL from environment variables
const getApiBaseUrl = (): string => {
  const apiHost = process.env.NEXT_PUBLIC_API_HOST;
  const apiPort = process.env.NEXT_PUBLIC_API_PORT;
  return `http://${apiHost}:${apiPort}`;
};

// Get user accounts from environment variable
export function getUserAccounts(): UserAccounts {
  try {
    const userAccountsJson = process.env.USER_ACCOUNTS || '{}';
    return parse(userAccountsJson) as UserAccounts;
  } catch (error) {
    console.error('Error parsing USER_ACCOUNTS environment variable:', error);
    return {};
  }
}

// Validate user with API
async function validateUserWithApi(username: string, password: string): Promise<AuthResponse> {
  try {
    // Call the authentication API
    const response = await fetch(`${getApiBaseUrl()}/api/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      })
    });
    
    if (!response.ok) {
      return { success: false, message: 'Invalid username or password' };
    }
    
    const data = await response.json() as ApiAuthResponse;
    
    // Check if the API response indicates this is a default password
    return { 
      success: true, 
      isDefaultPassword: data.user.is_default_password || false,
      message: data.message
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { 
      success: false, 
      message: 'Authentication service unavailable. Please try again later.' 
    };
  }
}

// Validate user with local API
async function validateUserWithLocal(username: string, password: string): Promise<AuthResponse> {
  try {
    // Call the local authentication API
    const response = await fetch('/api/local-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, message: errorData.message || 'Invalid username or password' };
    }
    
    const data = await response.json() as ApiAuthResponse;
    
    // Check if the response indicates this is a default password
    return { 
      success: true, 
      isDefaultPassword: data.user.is_default_password || false,
      message: data.message
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { 
      success: false, 
      message: 'Authentication service unavailable. Please try again later.' 
    };
  }
}

// Update password with API
async function updatePasswordWithApi(
  username: string, 
  currentPassword: string, 
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/users/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        current_password: currentPassword,
        new_password: newPassword
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { 
        success: false, 
        message: errorData.message || 'Failed to update password' 
      };
    }

    const data = await response.json() as ApiPasswordUpdateResponse;
    return {
      success: true,
      message: data.message
    };
  } catch (error) {
    console.error('Password update error:', error);
    return {
      success: false,
      message: 'Password update service unavailable. Please try again later.'
    };
  }
}

// Update password with local API
async function updatePasswordWithLocal(
  username: string, 
  currentPassword: string, 
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('/api/local-auth', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        current_password: currentPassword,
        new_password: newPassword
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { 
        success: false, 
        message: errorData.message || 'Failed to update password' 
      };
    }

    const data = await response.json() as ApiPasswordUpdateResponse;
    return {
      success: true,
      message: data.message
    };
  } catch (error) {
    console.error('Password update error:', error);
    return {
      success: false,
      message: 'Password update service unavailable. Please try again later.'
    };
  }
}

// Public API for validating users
export const validateUser = async (username: string, password: string): Promise<AuthResponse> => {
  const authMode = getAuthMode();
  
  if (authMode === 'local') {
    return validateUserWithLocal(username, password);
  } else {
    return validateUserWithApi(username, password);
  }
};

// Public API for updating passwords
export const updatePassword = async (
  username: string, 
  currentPassword: string, 
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  const authMode = getAuthMode();
  
  if (authMode === 'local') {
    return updatePasswordWithLocal(username, currentPassword, newPassword);
  } else {
    return updatePasswordWithApi(username, currentPassword, newPassword);
  }
};