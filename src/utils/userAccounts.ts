// Utility to handle user accounts from environment variables
import { parse } from 'json5'; // More forgiving JSON parser

interface UserAccount {
  password: string;
  // Add other user properties as needed
}

interface UserAccounts {
  [username: string]: UserAccount;
}

export function getUserAccounts(): UserAccounts {
  try {
    const userAccountsJson = process.env.USER_ACCOUNTS || '{}';
    return parse(userAccountsJson) as UserAccounts;
  } catch (error) {
    console.error('Error parsing USER_ACCOUNTS environment variable:', error);
    return {};
  }
}

// Create a new file or update existing one

interface AuthResponse {
  success: boolean;
  isDefaultPassword?: boolean;
  message?: string;
}

export const validateUser = async (username: string, password: string): Promise<AuthResponse> => {
  try {
    // Get token
    const token = process.env.NEXT_PUBLIC_AUTH_TOKEN;
    
    // Call the authentication API
    const response = await fetch('https://pws-user-api-1013020134920.asia-east2.run.app/api/auth', {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${token}`,
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
    
    const data = await response.json();
    
    // Check if the API response indicates this is a default password
    return { 
      success: true, 
      isDefaultPassword: data.isDefaultPassword || false 
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { 
      success: false, 
      message: 'Authentication service unavailable. Please try again later.' 
    };
  }
};