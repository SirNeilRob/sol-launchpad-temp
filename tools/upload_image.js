const fs = require("fs");
const path = require("path");

console.log("🖼️ CSN Token Image Upload Helper");
console.log("=================================");

// Function to find JPEG files in the project
function findJPEGFiles() {
  const jpegFiles = [];
  
  function searchDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'target' && file !== 'test-ledger') {
        searchDirectory(filePath);
      } else if (file.toLowerCase().endsWith('.jpeg') || file.toLowerCase().endsWith('.jpg')) {
        jpegFiles.push(filePath);
      }
    }
  }
  
  searchDirectory('.');
  return jpegFiles;
}

// Function to update image URLs in files
function updateImageURLs(newImageURL) {
  const filesToUpdate = [
    './metadata/csn-token-metadata.json',
    './csn-das-metadata.json',
    './metadata-config.json'
  ];
  
  filesToUpdate.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Update image URLs
      content = content.replace(
        /"image":\s*"[^"]*logo\.png[^"]*"/g,
        `"image": "${newImageURL}"`
      );
      
      content = content.replace(
        /"uri":\s*"[^"]*logo\.png[^"]*"/g,
        `"uri": "${newImageURL}"`
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated: ${filePath}`);
    }
  });
  
  // Update Rust constants
  const rustFiles = [
    './metadata/metadata-integration.rs',
    './tools/add_metadata_to_contract.js',
    './tools/integrate_metadata.js'
  ];
  
  rustFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      content = content.replace(
        /CSN_TOKEN_IMAGE:\s*&str\s*=\s*"[^"]*logo\.png[^"]*"/g,
        `CSN_TOKEN_IMAGE: &str = "${newImageURL}"`
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated: ${filePath}`);
    }
  });
}

// Main execution
function main() {
  console.log("🔍 Searching for JPEG files in your project...");
  const jpegFiles = findJPEGFiles();
  
  if (jpegFiles.length === 0) {
    console.log("❌ No JPEG files found in your project.");
    console.log("\n📁 Please place your JPEG image in the project directory.");
    console.log("   Supported formats: .jpg, .jpeg");
    return;
  }
  
  console.log(`✅ Found ${jpegFiles.length} JPEG file(s):`);
  jpegFiles.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });
  
  console.log("\n🌐 Image Hosting Options:");
  console.log("1. IPFS (Recommended for Web3)");
  console.log("2. GitHub (Upload to your repo)");
  console.log("3. Other hosting service");
  console.log("4. Manual URL entry");
  
  console.log("\n📋 Next Steps:");
  console.log("1. Choose a hosting option above");
  console.log("2. Upload your image to get a public URL");
  console.log("3. Run this script again with the URL");
  console.log("\n💡 Example usage:");
  console.log("   node tools/upload_image.js https://ipfs.io/ipfs/YOUR_IMAGE_HASH");
  console.log("   node tools/upload_image.js https://raw.githubusercontent.com/your-repo/csn-token/main/your-image.jpeg");
  
  // Check if URL was provided as argument
  const newImageURL = process.argv[2];
  if (newImageURL) {
    console.log(`\n🔄 Updating all metadata files with: ${newImageURL}`);
    updateImageURLs(newImageURL);
    console.log("\n✅ All metadata files updated successfully!");
    console.log("\n📋 Your image is now properly referenced in:");
    console.log("   - Token metadata JSON files");
    console.log("   - Rust integration code");
    console.log("   - Smart contract constants");
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  findJPEGFiles,
  updateImageURLs
}; 