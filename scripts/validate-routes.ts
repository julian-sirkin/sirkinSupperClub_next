const fs = require('fs');
const path = require('path');

// Function to check if a file is a valid module
function isValidModule(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for export statements
    const hasExports = content.includes('export') || 
                       content.includes('module.exports');
    
    // For API routes, check for handler functions
    const isApiRoute = filePath.includes('/api/');
    const hasHandlers = isApiRoute ? 
      (content.includes('export async function') || 
       content.includes('export function') ||
       content.includes('export const')) : true;
    
    return hasExports && hasHandlers;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return false;
  }
}

// Function to recursively scan directories
function scanDirectory(dir) {
  const invalidFiles = [];
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      invalidFiles.push(...scanDirectory(filePath));
    } else if (
      (file === 'route.ts' || file === 'route.js' || file === 'page.tsx' || file === 'page.js') &&
      !isValidModule(filePath)
    ) {
      invalidFiles.push(filePath);
    }
  }
  
  return invalidFiles;
}

// Main function
function validateRoutes() {
  console.log('Validating route files...');
  
  const apiDir = path.join(process.cwd(), 'src/app/api');
  const appDir = path.join(process.cwd(), 'src/app');
  
  const invalidApiFiles = fs.existsSync(apiDir) ? scanDirectory(apiDir) : [];
  const invalidAppFiles = scanDirectory(appDir).filter(file => !file.includes('/api/'));
  
  if (invalidApiFiles.length === 0 && invalidAppFiles.length === 0) {
    console.log('All route files are valid!');
    return;
  }
  
  console.log('\nInvalid API route files:');
  invalidApiFiles.forEach(file => console.log(`- ${file}`));
  
  console.log('\nInvalid page files:');
  invalidAppFiles.forEach(file => console.log(`- ${file}`));
  
  console.log('\nPlease fix these files to ensure they export the necessary functions.');
}

validateRoutes(); 