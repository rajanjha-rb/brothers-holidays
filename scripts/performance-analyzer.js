#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Performance analysis functions
function analyzeFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return (stats.size / 1024).toFixed(2);
  } catch {
    return 0;
  }
}

function analyzeDirectory(dirPath, extensions = ['.tsx', '.ts', '.js', '.jsx']) {
  const results = {
    files: [],
    totalSize: 0,
    largeFiles: [],
    clientComponents: 0,
    serverComponents: 0,
    dynamicImports: 0,
    useEffectCount: 0,
    useStateCount: 0,
  };

  function scanDirectory(currentPath) {
    try {
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDirectory(fullPath);
        } else if (stat.isFile() && extensions.includes(path.extname(item))) {
          const size = analyzeFileSize(fullPath);
          const relativePath = path.relative(dirPath, fullPath);
          
          results.files.push({ path: relativePath, size: parseFloat(size) });
          results.totalSize += parseFloat(size);
          
          if (parseFloat(size) > 10) {
            results.largeFiles.push({ path: relativePath, size: parseFloat(size) });
          }
          
          // Analyze file content for patterns
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            
            if (content.includes('"use client"')) {
              results.clientComponents++;
            } else if (content.includes('export default') && content.includes('function')) {
              results.serverComponents++;
            }
            
            if (content.includes('dynamic(')) {
              results.dynamicImports++;
            }
            
            const useEffectMatches = content.match(/useEffect/g);
            if (useEffectMatches) {
              results.useEffectCount += useEffectMatches.length;
            }
            
            const useStateMatches = content.match(/useState/g);
            if (useStateMatches) {
              results.useStateCount += useStateMatches.length;
            }
          } catch (err) {
            // Skip content analysis if file can't be read
          }
        }
      }
    } catch (err) {
      // Skip directories that can't be accessed
    }
  }
  
  scanDirectory(dirPath);
  return results;
}

function analyzeImages(publicDir) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
  const results = {
    images: [],
    totalSize: 0,
    largeImages: [],
    webpCount: 0,
    pngCount: 0,
    jpgCount: 0,
  };
  
  try {
    const files = fs.readdirSync(publicDir);
    
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (imageExtensions.includes(ext)) {
        const filePath = path.join(publicDir, file);
        const size = analyzeFileSize(filePath);
        
        results.images.push({ file, size: parseFloat(size), ext });
        results.totalSize += parseFloat(size);
        
        if (parseFloat(size) > 50) {
          results.largeImages.push({ file, size: parseFloat(size), ext });
        }
        
        if (ext === '.webp') results.webpCount++;
        else if (ext === '.png') results.pngCount++;
        else if (ext === '.jpg' || ext === '.jpeg') results.jpgCount++;
      }
    }
  } catch (err) {
    console.log('Could not analyze images directory');
  }
  
  return results;
}

function analyzeDependencies(packageJsonPath) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };
    
    const heavyDeps = [
      'appwrite', 'react-icons', '@radix-ui', '@tiptap', 
      'tinymce', 'lucide-react', 'date-fns'
    ];
    
    const foundHeavyDeps = heavyDeps.filter(dep => 
      Object.keys(allDeps).some(key => key.includes(dep))
    );
    
    return {
      totalDeps: Object.keys(allDeps).length,
      heavyDeps: foundHeavyDeps,
      hasAppwrite: !!allDeps.appwrite,
      hasReactIcons: !!allDeps['react-icons'],
      hasRadixUI: Object.keys(allDeps).some(key => key.includes('@radix-ui')),
      hasTipTap: Object.keys(allDeps).some(key => key.includes('@tiptap')),
    };
  } catch (err) {
    return { error: 'Could not analyze dependencies' };
  }
}

// Main analysis
function runAnalysis() {
  console.log('🔍 Starting comprehensive performance analysis...\n');
  
  const srcDir = path.join(__dirname, '../src');
  const publicDir = path.join(__dirname, '../public');
  const packageJsonPath = path.join(__dirname, '../package.json');
  
  // Analyze source code
  console.log('📁 Analyzing source code...');
  const codeAnalysis = analyzeDirectory(srcDir);
  
  // Analyze images
  console.log('🖼️  Analyzing images...');
  const imageAnalysis = analyzeImages(publicDir);
  
  // Analyze dependencies
  console.log('📦 Analyzing dependencies...');
  const depAnalysis = analyzeDependencies(packageJsonPath);
  
  // Generate report
  console.log('\n📊 PERFORMANCE ANALYSIS REPORT');
  console.log('=' .repeat(50));
  
  console.log('\n📁 SOURCE CODE ANALYSIS:');
  console.log(`Total files: ${codeAnalysis.files.length}`);
  console.log(`Total size: ${codeAnalysis.totalSize.toFixed(2)} KB`);
  console.log(`Client components: ${codeAnalysis.clientComponents}`);
  console.log(`Server components: ${codeAnalysis.serverComponents}`);
  console.log(`Dynamic imports: ${codeAnalysis.dynamicImports}`);
  console.log(`useEffect hooks: ${codeAnalysis.useEffectCount}`);
  console.log(`useState hooks: ${codeAnalysis.useStateCount}`);
  
  if (codeAnalysis.largeFiles.length > 0) {
    console.log('\n⚠️  Large files (>10KB):');
    codeAnalysis.largeFiles
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .forEach(file => {
        console.log(`  ${file.path}: ${file.size} KB`);
      });
  }
  
  console.log('\n🖼️  IMAGE ANALYSIS:');
  console.log(`Total images: ${imageAnalysis.images.length}`);
  console.log(`Total size: ${imageAnalysis.totalSize.toFixed(2)} KB`);
  console.log(`WebP: ${imageAnalysis.webpCount}, PNG: ${imageAnalysis.pngCount}, JPG: ${imageAnalysis.jpgCount}`);
  
  if (imageAnalysis.largeImages.length > 0) {
    console.log('\n⚠️  Large images (>50KB):');
    imageAnalysis.largeImages
      .sort((a, b) => b.size - a.size)
      .forEach(img => {
        console.log(`  ${img.file}: ${img.size} KB (${img.ext})`);
      });
  }
  
  console.log('\n📦 DEPENDENCY ANALYSIS:');
  console.log(`Total dependencies: ${depAnalysis.totalDeps}`);
  if (depAnalysis.heavyDeps.length > 0) {
    console.log('⚠️  Heavy dependencies detected:');
    depAnalysis.heavyDeps.forEach(dep => console.log(`  - ${dep}`));
  }
  
  // Performance recommendations
  console.log('\n💡 PERFORMANCE RECOMMENDATIONS:');
  
  if (codeAnalysis.useEffectCount > 20) {
    console.log('⚠️  High number of useEffect hooks - consider optimization');
  }
  
  if (codeAnalysis.useStateCount > 30) {
    console.log('⚠️  High number of useState hooks - consider state management optimization');
  }
  
  if (imageAnalysis.totalSize > 500) {
    console.log('⚠️  Large image bundle - consider optimization and lazy loading');
  }
  
  if (depAnalysis.hasReactIcons) {
    console.log('💡 Consider tree-shaking react-icons or using specific imports');
  }
  
  if (depAnalysis.hasRadixUI) {
    console.log('💡 Radix UI detected - ensure proper tree-shaking');
  }
  
  if (codeAnalysis.clientComponents > codeAnalysis.serverComponents) {
    console.log('⚠️  More client components than server components - consider SSR optimization');
  }
  
  return {
    codeAnalysis,
    imageAnalysis,
    depAnalysis
  };
}

if (require.main === module) {
  runAnalysis();
}

module.exports = { runAnalysis }; 