import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface UserAccount {
  password: string;
  isDefaultPassword?: boolean;
}

interface UserAccounts {
  [username: string]: UserAccount;
}

// Get user accounts from local JSON file
function getUserAccounts(): UserAccounts {
  try {
    const filePath = path.join(process.cwd(), 'src', 'config', 'userAccounts.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent) as UserAccounts;
  } catch (error) {
    console.error('Error reading user accounts file:', error);
    return {};
  }
}

// Save user accounts to local JSON file
function saveUserAccounts(accounts: UserAccounts): boolean {
  try {
    const filePath = path.join(process.cwd(), 'src', 'config', 'userAccounts.json');
    fs.writeFileSync(filePath, JSON.stringify(accounts, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing user accounts file:', error);
    return false;
  }
}

// Handle authentication requests
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required' },
        { status: 400 }
      );
    }
    
    const accounts = getUserAccounts();
    
    // Since username is now hashed, we directly check if it exists in accounts
    if (!accounts[username]) {
      return NextResponse.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      );
    }
    
    // Since password is now hashed, we directly compare the hashed values
    if (accounts[username].password !== password) {
      return NextResponse.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      message: 'Authentication successful',
      user: {
        id: 1, // Dummy ID
        username,
        is_default_password: accounts[username].isDefaultPassword || false
      }
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle password update requests
export async function PUT(request: NextRequest) {
  try {
    const { username, current_password, new_password } = await request.json();
    
    if (!username || !current_password || !new_password) {
      return NextResponse.json(
        { message: 'Username, current password, and new password are required' },
        { status: 400 }
      );
    }
    
    const accounts = getUserAccounts();
    
    // Since username is now hashed, we directly check if it exists in accounts
    if (!accounts[username]) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Since password is now hashed, we directly compare the hashed values
    if (accounts[username].password !== current_password) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 401 }
      );
    }
    
    // Update the password (already hashed) and set isDefaultPassword to false
    accounts[username].password = new_password;
    accounts[username].isDefaultPassword = false;
    
    const success = saveUserAccounts(accounts);
    
    if (!success) {
      return NextResponse.json(
        { message: 'Failed to update password' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}