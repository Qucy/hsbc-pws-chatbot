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

export function validateUser(username: string, password: string): boolean {
  const accounts = getUserAccounts();
  return accounts[username]?.password === password;
}