#!/bin/bash

# Weather-Delivery Dashboard Setup Script
echo "🌦️📦 Setting up Weather-Delivery Correlation Dashboard..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "🔧 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "🎨 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Create environment file for backend
echo "⚙️ Setting up environment configuration..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "📝 Created backend/.env file. Please add your OpenWeatherMap API key if you have one."
    echo "   The dashboard will work with simulated data if no API key is provided."
fi

# Make scripts executable
chmod +x start.sh
chmod +x test-system.sh
chmod +x run-tests.sh

# Create startup script (already exists, just make sure it's executable)
if [ ! -f start.sh ]; then
cat > start.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Weather-Delivery Dashboard..."
echo "📊 Backend API will be available at: http://localhost:5011"
echo "🌐 Frontend dashboard will be available at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both backend and frontend concurrently
npm run dev
EOF

chmod +x start.sh
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. (Optional) Add your OpenWeatherMap API key to backend/.env"
echo "   2. Run './start.sh' to start the dashboard"
echo "   3. Open http://localhost:3000 in your browser"
echo ""
echo "🔗 Useful commands:"
echo "   ./start.sh          - Start both backend and frontend"
echo "   npm run dev         - Start both servers (alternative)"
echo "   npm run dev-backend - Start only backend server"
echo "   npm run dev-frontend- Start only frontend server"
echo "   ./run-tests.sh      - Run all tests (unit + integration)"
echo "   npm run test-unit   - Run only unit tests"
echo "   ./test-system.sh    - Run only system tests"
echo ""
echo "📚 Documentation:"
echo "   README.md           - Project overview and features"
echo "   .kiro/              - AI development process documentation"
echo "   docs/               - Blog post and detailed analysis"
echo ""
echo "Happy analyzing! 🌦️📊"