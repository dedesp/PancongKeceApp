#!/bin/bash

echo "🚀 Menyiapkan bundle deployment PancongKeceApp..."

# Create deployment directory
DEPLOY_DIR="PancongKeceApp-Deploy"
rm -rf $DEPLOY_DIR
mkdir $DEPLOY_DIR

echo "📁 Copying files..."

# Copy main files
cp index.html $DEPLOY_DIR/
cp package.json $DEPLOY_DIR/
cp README-DEPLOYMENT.md $DEPLOY_DIR/README.md
cp .gitignore $DEPLOY_DIR/

# Copy backend
cp -r backend $DEPLOY_DIR/

# Copy only essential backend files
cd $DEPLOY_DIR/backend

# Keep only essential directories
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf *.log 2>/dev/null || true

echo "✅ Bundle created: $DEPLOY_DIR"
echo ""
echo "📋 Bundle contents:"
echo "   ├── index.html (Frontend)"
echo "   ├── package.json (Main config)"  
echo "   ├── README.md (Deployment guide)"
echo "   └── backend/ (API Server)"
echo "       ├── server-minimal.js (Production server)"
echo "       ├── database/ (SQLite with mock data)"
echo "       ├── node_modules/ (Dependencies)"
echo "       └── ... (Other backend files)"
echo ""
echo "🎉 Ready to upload to hosting!"
echo ""
echo "📤 Upload instructions:"
echo "1. Zip the '$DEPLOY_DIR' folder"
echo "2. Upload to your hosting's public_html or app directory"
echo "3. Run: npm start"
echo "4. Access your app!"
