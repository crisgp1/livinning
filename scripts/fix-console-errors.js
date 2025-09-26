const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Priority files to fix first
const PRIORITY_FILES = [
  'app/api/**/*.ts',
  'lib/infrastructure/**/*.ts',
  'lib/application/**/*.ts',
  'components/ServiceOrders.tsx',
  'components/ProviderServicesList.tsx',
  'app/provider-dashboard/**/*.tsx',
  'app/dashboard/**/*.tsx'
];

function fixConsoleErrors(filePath) {
  console.log(`Processing: ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file already imports logger
  const hasLoggerImport = content.includes("import logger from '@/lib/utils/logger'");
  
  let newContent = content;
  
  // Add logger import if needed and console.error is found
  if (!hasLoggerImport && content.includes('console.error')) {
    // Find the best place to add the import
    const importRegex = /^import\s+.*from\s+['"][^'"]*['"];?\s*$/gm;
    const imports = content.match(importRegex) || [];
    
    if (imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      const insertIndex = lastImportIndex + lastImport.length;
      
      newContent = content.slice(0, insertIndex) + 
                   "\nimport logger from '@/lib/utils/logger'" + 
                   content.slice(insertIndex);
    } else {
      // No existing imports, add at the top
      newContent = "import logger from '@/lib/utils/logger'\n" + content;
    }
  }
  
  // Replace console.error patterns
  // Pattern 1: console.error('message', data)
  newContent = newContent.replace(
    /console\.error\(\s*(['"`])([^'"]*)\1\s*,\s*([^)]+)\)/g,
    "logger.error('Component', '$2', $3)"
  );
  
  // Pattern 2: console.error('message')
  newContent = newContent.replace(
    /console\.error\(\s*(['"`])([^'"]*)\1\s*\)/g,
    "logger.error('Component', '$2')"
  );
  
  // Pattern 3: console.error(variable)
  newContent = newContent.replace(
    /console\.error\(\s*([^'"`][^)]*)\)/g,
    "logger.error('Component', 'Error occurred', $1)"
  );
  
  // Detect component name from file path for better logging
  const componentName = path.basename(filePath, path.extname(filePath))
    .replace(/([A-Z])/g, ' $1')
    .trim();
  
  // Replace generic 'Component' with actual component name
  newContent = newContent.replace(
    /logger\.error\('Component'/g, 
    `logger.error('${componentName}'`
  );
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Fixed console.error calls in: ${filePath}`);
    return true;
  }
  
  return false;
}

function main() {
  console.log('🔧 Starting console.error replacement...\n');
  
  let totalFixed = 0;
  
  PRIORITY_FILES.forEach(pattern => {
    const files = glob.sync(pattern, { cwd: process.cwd() });
    
    files.forEach(file => {
      const filePath = path.resolve(file);
      if (fs.existsSync(filePath)) {
        const fixed = fixConsoleErrors(filePath);
        if (fixed) totalFixed++;
      }
    });
  });
  
  console.log(`\n✅ Completed! Fixed ${totalFixed} files`);
  console.log('\n⚠️  Note: Please review the changes and manually adjust component names as needed.');
}

if (require.main === module) {
  main();
}

module.exports = { fixConsoleErrors };