const fs = require('fs');
const path = require('path');

// Path to the userAccounts.json file
const userAccountsPath = path.join(__dirname, '..', 'src', 'config', 'userAccounts.json');
const backupPath = path.join(__dirname, '..', 'src', 'config', 'userAccounts.backup.json');

function fixDuplicateKeys() {
  try {
    console.log('Reading userAccounts.json...');
    
    // Read the file as text to preserve order and formatting
    const fileContent = fs.readFileSync(userAccountsPath, 'utf8');
    
    // Create backup
    fs.writeFileSync(backupPath, fileContent);
    console.log('Backup created at:', backupPath);
    
    // Parse JSON to get the data
    const userData = JSON.parse(fileContent);
    
    // Track seen keys and their counts
    const seenKeys = new Map();
    const newUserData = {};
    
    // Process each key in order
    for (const [key, value] of Object.entries(userData)) {
      let newKey = key;
      
      if (seenKeys.has(key)) {
        // This is a duplicate, increment counter and append suffix
        const count = seenKeys.get(key) + 1;
        seenKeys.set(key, count);
        newKey = `${key}-${count}`;
        console.log(`Duplicate found: ${key} -> renamed to: ${newKey}`);
      } else {
        // First occurrence of this key
        seenKeys.set(key, 0);
      }
      
      newUserData[newKey] = value;
    }
    
    // Write the fixed data back to file
    const fixedContent = JSON.stringify(newUserData, null, 2);
    fs.writeFileSync(userAccountsPath, fixedContent);
    
    console.log('\n✅ Fixed duplicate keys successfully!');
    console.log(`📊 Total entries processed: ${Object.keys(userData).length}`);
    console.log(`📊 Unique entries after fix: ${Object.keys(newUserData).length}`);
    console.log(`🔧 Duplicates renamed: ${Object.keys(newUserData).length - seenKeys.size}`);
    
    // Show summary of duplicates found
    const duplicates = Array.from(seenKeys.entries()).filter(([key, count]) => count > 0);
    if (duplicates.length > 0) {
      console.log('\n📋 Summary of duplicates fixed:');
      duplicates.forEach(([key, count]) => {
        console.log(`  - ${key}: found ${count + 1} times (renamed ${count} duplicates)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error fixing duplicate keys:', error.message);
    process.exit(1);
  }
}

// Add validation function to check for remaining duplicates
function validateNoDuplicates() {
  try {
    const fileContent = fs.readFileSync(userAccountsPath, 'utf8');
    const userData = JSON.parse(fileContent);
    const keys = Object.keys(userData);
    const uniqueKeys = new Set(keys);
    
    if (keys.length === uniqueKeys.size) {
      console.log('✅ Validation passed: No duplicate keys found!');
      return true;
    } else {
      console.log('❌ Validation failed: Duplicate keys still exist!');
      return false;
    }
  } catch (error) {
    console.error('❌ Error during validation:', error.message);
    return false;
  }
}

// Main execution
if (require.main === module) {
  console.log('🔧 Starting duplicate key fix process...');
  console.log('=' .repeat(50));
  
  fixDuplicateKeys();
  
  console.log('\n🔍 Validating results...');
  validateNoDuplicates();
  
  console.log('\n✨ Process completed!');
  console.log('💡 Tip: Check the backup file if you need to revert changes.');
}

module.exports = { fixDuplicateKeys, validateNoDuplicates };