const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Function to hash a string using SHA-256 (same as in userAccounts.ts)
function hashString(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

// Paths to the input and output files
const defaultPasswordsPath = path.join(__dirname, '..', 'default_passwords.json');
const userAccountsPath = path.join(__dirname, '..', 'src', 'config', 'userAccounts.json');

// Read the default passwords file
const defaultPasswords = JSON.parse(fs.readFileSync(defaultPasswordsPath, 'utf8'));

// Create the new user accounts object
const userAccounts = {};

// Process each entry in the default passwords file
Object.entries(defaultPasswords).forEach(([email, data]) => {
  // Hash the email (username) and password
  const hashedEmail = hashString(email);
  const hashedPassword = hashString(data.password);
  
  // Create the entry in the new format
  userAccounts[hashedEmail] = {
    password: hashedPassword,
    isDefaultPassword: data.isDefaultPassword
  };
});

// Write the new user accounts file
fs.writeFileSync(userAccountsPath, JSON.stringify(userAccounts, null, 2), 'utf8');

console.log(`Migration complete! ${Object.keys(userAccounts).length} accounts migrated.`);