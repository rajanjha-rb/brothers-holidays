#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to get file size in KB
function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / 1024).toFixed(2);
}

// Function to analyze images in public directory
function analyzeImages() {
  const publicDir = path.join(__dirname, '../public');
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
  
  console.log('🔍 Analyzing images in public directory...\n');
  
  const files = fs.readdirSync(publicDir);
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return imageExtensions.includes(ext);
  });
  
  let totalSize = 0;
  
  imageFiles.forEach(file => {
    const filePath = path.join(publicDir, file);
    const size = getFileSize(filePath);
    totalSize += parseFloat(size);
    
    const sizeKB = parseFloat(size);
    let status = '✅';
    if (sizeKB > 100) {
      status = '⚠️';
    } else if (sizeKB > 50) {
      status = '⚡';
    }
    
    console.log(`${status} ${file}: ${size} KB`);
  });
  
  console.log(`\n📊 Total image size: ${totalSize.toFixed(2)} KB`);
  
  if (totalSize > 500) {
    console.log('\n🚨 Warning: Total image size is quite large. Consider:');
    console.log('   - Converting images to WebP format');
    console.log('   - Compressing images further');
    console.log('   - Using responsive images with different sizes');
    console.log('   - Implementing lazy loading for images below the fold');
  }
  
  return { imageFiles, totalSize };
}

// Function to suggest optimizations
function suggestOptimizations() {
  console.log('\n💡 Performance Optimization Suggestions:');
  console.log('1. Use Next.js Image component with proper sizing');
  console.log('2. Implement lazy loading for images below the fold');
  console.log('3. Use WebP format for better compression');
  console.log('4. Consider using a CDN for image delivery');
  console.log('5. Implement responsive images with srcset');
  console.log('6. Use blur placeholder for better perceived performance');
}

if (require.main === module) {
  try {
    analyzeImages();
    suggestOptimizations();
  } catch (error) {
    console.error('Error analyzing images:', error.message);
  }
}

module.exports = { analyzeImages, suggestOptimizations }; 