#!/usr/bin/env bash

set -e

REPO="Quicksi-CLI/quicksiCLI"
BINARY_NAME="quicksi"

echo "🚀 Installing Quicksi CLI..."

# Detect OS
OS="$(uname -s)"

case "$OS" in
  Linux*)     FILE="quicksi-linux" ;;
  Darwin*)    FILE="quicksi-macos" ;;
  *)
    echo "❌ Unsupported OS: $OS"
    exit 1
    ;;
esac

DOWNLOAD_URL="https://github.com/$REPO/releases/latest/download/$FILE"

TMP_FILE="/tmp/$FILE"

echo "⬇️ Downloading..."
curl -L "$DOWNLOAD_URL" -o "$TMP_FILE"

# Make executable
chmod +x "$TMP_FILE"

# Install location
INSTALL_DIR="/usr/local/bin"

if [ ! -w "$INSTALL_DIR" ]; then
  INSTALL_DIR="$HOME/.local/bin"
  mkdir -p "$INSTALL_DIR"

  echo "⚠️ No permission for /usr/local/bin"
  echo "📁 Installing to $INSTALL_DIR"

  SHELL_NAME="$(basename "$SHELL")"

  if [[ "$SHELL_NAME" == "zsh" ]]; then
    PROFILE="$HOME/.zshrc"
  else
    PROFILE="$HOME/.bashrc"
  fi

  if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    echo "export PATH=\"$INSTALL_DIR:\$PATH\"" >> "$PROFILE"
    echo "⚠️ Restart terminal after install"
  fi
else
  echo "📁 Installing to /usr/local/bin"
fi

# Move binary and rename to "quicksi"
mv "$TMP_FILE" "$INSTALL_DIR/$BINARY_NAME"

echo ""
echo "✅ Quicksi installed successfully!"
echo "👉 Run: quicksi"
echo ""
