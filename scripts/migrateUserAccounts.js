const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Function to hash a string using SHA-256
function hashString(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

// Path to the user accounts file
const userAccountsPath = path.join(process.cwd(), 'src', 'config', 'userAccounts.json');

// Read the current user accounts
try {
  const fileContent = fs.readFileSync(userAccountsPath, 'utf8');
  const accounts = JSON.parse(fileContent);
  
  // Create a new object with hashed usernames and passwords
  const hashedAccounts = {};
  
  // Store a mapping of hashed usernames to original usernames for reference
  // This is just for your reference during development
  const usernameMapping = {};
  
  Object.entries(accounts).forEach(([username, accountData]) => {
    const hashedUsername = hashString(username);
    const hashedPassword = hashString(accountData.password);
    
    hashedAccounts[hashedUsername] = {
      password: hashedPassword,
      isDefaultPassword: accountData.isDefaultPassword
    };
    
    usernameMapping[hashedUsername] = username;
  });
  
  // Save the hashed accounts
  fs.writeFileSync(
    userAccountsPath, 
    JSON.stringify(hashedAccounts, null, 2), 
    'utf8'
  );
  
  // Save the username mapping for reference (optional)
  fs.writeFileSync(
    path.join(process.cwd(), 'scripts', 'username_mapping.json'),
    JSON.stringify(usernameMapping, null, 2),
    'utf8'
  );
  
  console.log('User accounts successfully migrated to hashed format!');
  console.log('Username mapping saved to scripts/username_mapping.json for reference');
} catch (error) {
  console.error('Error migrating user accounts:', error);
}