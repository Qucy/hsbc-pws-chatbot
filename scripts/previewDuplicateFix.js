const fs = require('fs');
const path = require('path');

const userAccountsPath = path.join(__dirname, '..', 'src', 'config', 'userAccounts.json');

function previewDuplicateFix() {
  try {
    const fileContent = fs.readFileSync(userAccountsPath, 'utf8');
    const userData = JSON.parse(fileContent);
    
    const seenKeys = new Map();
    const changes = [];
    
    for (const key of Object.keys(userData)) {
      if (seenKeys.has(key)) {
        const count = seenKeys.get(key) + 1;
        seenKeys.set(key, count);
        const newKey = `${key}-${count}`;
        changes.push({ original: key, renamed: newKey });
      } else {
        seenKeys.set(key, 0);
      }
    }
    
    console.log('🔍 Preview of changes that would be made:');
    console.log('=' .repeat(50));
    
    if (changes.length === 0) {
      console.log('✅ No duplicate keys found!');
    } else {
      changes.forEach(change => {
        console.log(`${change.original} -> ${change.renamed}`);
      });
      console.log(`\n📊 Total duplicates to be renamed: ${changes.length}`);
    }
    
  } catch (error) {
    console.error('❌ Error during preview:', error.message);
  }
}

if (require.main === module) {
  previewDuplicateFix();
}

module.exports = { previewDuplicateFix };