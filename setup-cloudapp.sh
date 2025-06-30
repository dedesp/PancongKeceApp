# Quick Setup for CloudApp Web ID

# 1. Extract dan pindahkan ke public_html
# 2. Setup database di control panel
# 3. Update .env file
# 4. Run setup script

echo "🚀 Starting CloudApp deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run from project root."
    exit 1
fi

echo "📁 Setting up file permissions..."
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;
chmod +x backend/server.js

echo "📝 Creating .htaccess for CloudApp..."
cat > .htaccess << 'EOF'
RewriteEngine On

# Handle API requests
RewriteRule ^api/(.*)$ backend/server.js [QSA,L]

# Handle frontend routes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [QSA,L]

# Security headers
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-Content-Type-Options "nosniff"
Header always set X-XSS-Protection "1; mode=block"
EOF

echo "🔧 Creating startup script..."
cat > start-app.sh << 'EOF'
#!/bin/bash
cd backend
export NODE_ENV=production
node server.js
EOF
chmod +x start-app.sh

echo "📋 Creating environment template..."
cat > .env.cloudapp << 'EOF'
# ===================================
# CLOUDAPP HOSTING CONFIGURATION
# ===================================

# Database (Update dengan kredensial dari CloudApp)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_database_name
DB_USER=your_db_username
DB_PASS=your_db_password

# Server
PORT=3001
NODE_ENV=production

# Security
JWT_SECRET=cloudapp_pancong_kece_2025_super_secret

# URLs (Update dengan domain CloudApp kamu)
FRONTEND_URL=https://your-subdomain.cloudapp.web.id
API_URL=https://your-subdomain.cloudapp.web.id/api

# Features
ENABLE_CORS=true
ENABLE_LOGGING=true
ENABLE_COMPRESSION=true
EOF

echo "✅ CloudApp setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env.cloudapp dengan kredensial database"
echo "2. Rename .env.cloudapp ke .env"
echo "3. Run: cd backend && npm run setup"
echo "4. Start app: ./start-app.sh"
echo ""
echo "🌐 Access your app at: https://your-domain.cloudapp.web.id"
