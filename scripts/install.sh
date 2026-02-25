#!/bin/bash
# Thought System Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/unblended/thought-system/main/scripts/install.sh | bash

set -e

INSTALL_DIR="$HOME/.thought-system"
REPO_URL="https://github.com/unblended/thought-system.git"
NODE_MIN_VERSION="18"

echo "🧠 Thought System Installer"
echo "============================"

# Check Node.js version
check_node() {
  if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js ${NODE_MIN_VERSION} or higher."
    exit 1
  fi

  NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_VERSION" -lt "$NODE_MIN_VERSION" ]; then
    echo "❌ Node.js ${NODE_MIN_VERSION} or higher required. Found: $(node -v)"
    exit 1
  fi

  echo "✓ Node.js $(node -v)"
}

# Clone or update repository
setup_repo() {
  if [ -d "$INSTALL_DIR" ]; then
    echo "📁 Directory exists, updating..."
    cd "$INSTALL_DIR"
    git pull origin main
  else
    echo "📥 Cloning repository..."
    git clone "$REPO_URL" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
  fi
}

# Install dependencies
install_deps() {
  echo "📦 Installing dependencies..."
  npm install --production
}

# Run migrations
run_migrations() {
  echo "🗄️  Running database migrations..."
  npm run migrate
}

# Create CLI symlink
create_symlink() {
  echo "🔗 Creating CLI symlink..."
  
  # Try /usr/local/bin first, fall back to ~/.local/bin
  if [ -w /usr/local/bin ]; then
    ln -sf "$INSTALL_DIR/bin/thought-system" /usr/local/bin/thought-system
    echo "✓ CLI available: thought-system"
  else
    mkdir -p "$HOME/.local/bin"
    ln -sf "$INSTALL_DIR/bin/thought-system" "$HOME/.local/bin/thought-system"
    
    # Add to PATH if needed
    if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
      echo ""
      echo "⚠️  Add to your PATH:"
      echo "   export PATH=\"\$HOME/.local/bin:\$PATH\""
      echo ""
    fi
    
    echo "✓ CLI available: $HOME/.local/bin/thought-system"
  fi
}

# Create .env file if not exists
create_env() {
  if [ ! -f "$INSTALL_DIR/.env" ]; then
    echo "📝 Creating .env file..."
    cat > "$INSTALL_DIR/.env" << 'EOF'
# OpenClaw Configuration
OPENCLAW_URL=http://localhost:8080
OPENCLAW_TOKEN=your_token_here

# Thought System Configuration
THOUGHT_SYSTEM_PORT=3456

# Optional: Default delivery settings
DEFAULT_CHANNEL=telegram
DEFAULT_TARGET=8388779580
EOF
    echo "⚠️  Please edit $INSTALL_DIR/.env and set your OPENCLAW_TOKEN"
  fi
}

# Main installation
main() {
  check_node
  setup_repo
  install_deps
  run_migrations
  create_symlink
  create_env

  echo ""
  echo "✅ Installation complete!"
  echo ""
  echo "Next steps:"
  echo "1. Edit $INSTALL_DIR/.env and set your OPENCLAW_TOKEN"
  echo "2. Start the server: thought-system start"
  echo "3. Test: thought-system ingest 'Hello world' --tags test"
  echo ""
  echo "Optional (when ready):"
  echo "4. Install cron jobs: thought-system install-cron"
  echo ""
}

main "$@"
