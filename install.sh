#!/usr/bin/env bash

set -e

REPO="Quicksi-CLI/quicksi"
BINARY_NAME="quicksi"

echo "🚀 Installing Quicksi CLI..."

# 🔍 Detect OS
OS="$(uname -s)"

case "$OS" in
  Linux*)     PLATFORM="linux" ;;
  Darwin*)    PLATFORM="macos" ;;
  CYGWIN*|MINGW*|MSYS*) PLATFORM="win.exe" ;;
  *)
    echo "❌ Unsupported OS: $OS"
    exit 1
    ;;
esac

# 🔥 Detect architecture (optional for future)
ARCH="$(uname -m)"

echo "🖥️ Detected OS: $PLATFORM"

# 🔗 Build download URL
DOWNLOAD_URL="https://github.com/$REPO/releases/latest/download/$BINARY_NAME-$PLATFORM"

TMP_FILE="/tmp/$BINARY_NAME"

# 🧹 Cleanup old temp
rm -f "$TMP_FILE"

# 📥 Download binary
echo "⬇️ Downloading..."
curl -L "$DOWNLOAD_URL" -o "$TMP_FILE"

# 🔐 Make executable (not needed for Windows)
chmod +x "$TMP_FILE"

# 📦 Install location
INSTALL_DIR="/usr/local/bin"

# 🧠 If no permission, fallback to ~/.local/bin
if [ ! -w "$INSTALL_DIR" ]; then
  INSTALL_DIR="$HOME/.local/bin"
  mkdir -p "$INSTALL_DIR"

  echo "⚠️ No permission for /usr/local/bin"
  echo "📁 Installing to $INSTALL_DIR"

  # Add to PATH if missing
  if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
    echo "⚠️ Added $INSTALL_DIR to PATH. Restart your terminal."
  fi
else
  echo "📁 Installing to /usr/local/bin"
fi

# 🚚 Move binary
mv "$TMP_FILE" "$INSTALL_DIR/$BINARY_NAME"

# 🎉 Done
echo ""
echo "✅ Quicksi installed successfully!"
echo "👉 Run: quicksi"
echo ""
