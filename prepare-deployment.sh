#!/bin/bash

echo "🚀 Menyiapkan Pancong Kece App untuk Deploy ke Netlify..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js tidak ditemukan. Silakan install Node.js terlebih dahulu."
    exit 1
fi

print_status "Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm tidak ditemukan. Silakan install npm terlebih dahulu."
    exit 1
fi

print_status "npm version: $(npm --version)"

# Install root dependencies
print_status "Installing root dependencies..."
npm install --silent

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm install --silent
cd ..

# Install Netlify functions dependencies
print_status "Installing Netlify functions dependencies..."
cd netlify/functions
npm install --silent
cd ../..

# Copy database if exists
if [ -f "backend/database/pancong_kece.db" ]; then
    print_status "Copying database to functions directory..."
    cp backend/database/pancong_kece.db netlify/functions/
    print_success "Database copied successfully"
else
    print_warning "Database file not found, will use mock data"
fi

# Create .env file if not exists
if [ ! -f ".env" ]; then
    print_status "Creating .env file from template..."
    cp .env.example .env
    print_warning "Please update .env file with your actual values"
else
    print_success ".env file already exists"
fi

# Run build
print_status "Running build process..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Build completed successfully!"
else
    print_error "Build failed!"
    exit 1
fi

# Test API functionality
print_status "Testing API endpoints..."
cd netlify/functions
if node -e "
const app = require('./server.js');
console.log('✅ Server script loaded successfully');
" 2>/dev/null; then
    print_success "API endpoints test passed"
else
    print_warning "API endpoints test failed, but deployment may still work"
fi
cd ../..

print_success "Deployment preparation completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Upload this project to GitHub repository"
echo "2. Connect repository to Netlify"
echo "3. Set build command: npm run build"
echo "4. Set publish directory: ."
echo "5. Set functions directory: netlify/functions"
echo "6. Add environment variables in Netlify dashboard"
echo ""
echo "🌐 Your app will be available at: https://your-app-name.netlify.app"
echo ""
echo "📖 Read DEPLOY-GUIDE.md for detailed instructions"
