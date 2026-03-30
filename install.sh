#!/usr/bin/env bash

set -e

REPO="Quicksi-CLI/quicksiCLI"
BINARY_NAME="quicksi"

echo "🚀 Installing Quicksi CLI..."

# Detect OS
OS="$(uname -s)"

case "$OS" in
  Linux*)     FILE="quicksi-linux.tar.gz" ;;
  Darwin*)    FILE="quicksi-macos.tar.gz" ;;
  *)
    echo "❌ Unsupported OS: $OS"
    exit 1
    ;;
esac

DOWNLOAD_URL="https://github.com/$REPO/releases/latest/download/$FILE"

TMP_DIR="/tmp/quicksi-install"
mkdir -p "$TMP_DIR"

echo "⬇️ Downloading..."
curl -L "$DOWNLOAD_URL" -o "$TMP_DIR/$FILE"

echo "📦 Extracting..."
tar -xzf "$TMP_DIR/$FILE" -C "$TMP_DIR"

chmod +x "$TMP_DIR/quicksi"

# Install location
INSTALL_DIR="/usr/local/bin"

if [ ! -w "$INSTALL_DIR" ]; then
  INSTALL_DIR="$HOME/.local/bin"
  mkdir -p "$INSTALL_DIR"

  echo "⚠️ No permission for /usr/local/bin"
  echo "📁 Installing to $INSTALL_DIR"

  if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
    echo "⚠️ Restart terminal after install"
  fi
fi

mv "$TMP_DIR/quicksi" "$INSTALL_DIR/quicksi"

echo ""
echo "✅ Quicksi installed successfully!"
echo "👉 Run: quicksi"
echo ""
