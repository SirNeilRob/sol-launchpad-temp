const fs = require("fs");

console.log("🌐 CSN Token GitHub Image Setup");
console.log("===============================");

// Check if the image exists
const imagePath = "./assets/CryptoSun.jpeg";
if (!fs.existsSync(imagePath)) {
  console.log("❌ CryptoSun.jpeg not found in assets folder");
  console.log("   Please make sure the image is in: ./assets/CryptoSun.jpeg");
  process.exit(1);
}

console.log("✅ Found CryptoSun.jpeg in assets folder");
console.log("📁 File size:", (fs.statSync(imagePath).size / 1024).toFixed(1), "KB");

// Get GitHub URL from user
console.log("\n🔗 GitHub Repository Setup:");
console.log("1. Push your project to GitHub (if not already done)");
console.log("2. Make sure the assets/CryptoSun.jpeg file is in your repository");
console.log("3. The URL will be: https://raw.githubusercontent.com/USERNAME/REPO/main/assets/CryptoSun.jpeg");

// Function to update all metadata files with the new image URL
function updateImageURLs(githubURL) {
  console.log(`\n🔄 Updating metadata files with: ${githubURL}`);
  
  const filesToUpdate = [
    './metadata/csn-token-metadata.json',
    './csn-das-metadata.json'
  ];
  
  filesToUpdate.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Update image URLs
      content = content.replace(
        /"image":\s*"[^"]*logo\.png[^"]*"/g,
        `"image": "${githubURL}"`
      );
      
      content = content.replace(
        /"uri":\s*"[^"]*logo\.png[^"]*"/g,
        `"uri": "${githubURL}"`
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated: ${filePath}`);
    }
  });
  
  // Update Rust constants in integration files
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
        `CSN_TOKEN_IMAGE: &str = "${githubURL}"`
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated: ${filePath}`);
    }
  });
  
  console.log("\n🎉 All metadata files updated successfully!");
  console.log("\n📋 Your CSN token now uses CryptoSun.jpeg as its logo!");
}

// Check if URL was provided as argument
const githubURL = process.argv[2];
if (githubURL) {
  if (githubURL.includes('raw.githubusercontent.com') && githubURL.includes('CryptoSun.jpeg')) {
    updateImageURLs(githubURL);
  } else {
    console.log("❌ Invalid GitHub URL format");
    console.log("Expected format: https://raw.githubusercontent.com/USERNAME/REPO/main/assets/CryptoSun.jpeg");
  }
} else {
  console.log("\n💡 To update metadata with your GitHub URL, run:");
  console.log("   node tools/setup_github_image.js https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/assets/CryptoSun.jpeg");
  
  console.log("\n📋 Example:");
  console.log("   node tools/setup_github_image.js https://raw.githubusercontent.com/johndoe/csn-token/main/assets/CryptoSun.jpeg");
  
  console.log("\n🔍 Quick GitHub Setup:");
  console.log("1. git add assets/CryptoSun.jpeg");
  console.log("2. git commit -m 'Add CSN token logo'");
  console.log("3. git push origin main");
  console.log("4. Copy the raw URL from GitHub");
  console.log("5. Run this script with the URL");
}

module.exports = {
  updateImageURLs
}; 