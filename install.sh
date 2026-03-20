#!/bin/bash
set -euo pipefail

REPO="corespeed-io/brow"
BINARY_NAME="brow"
INSTALL_DIR="$HOME/.local/bin"

# Detect OS
OS="$(uname -s)"
case "$OS" in
  Linux*)  PLATFORM="linux" ;;
  Darwin*) PLATFORM="darwin" ;;
  *)
    echo "Error: Unsupported operating system: $OS"
    exit 1
    ;;
esac

# Detect architecture
ARCH="$(uname -m)"
case "$ARCH" in
  x86_64|amd64) ARCH="x64" ;;
  aarch64|arm64) ARCH="arm64" ;;
  *)
    echo "Error: Unsupported architecture: $ARCH"
    exit 1
    ;;
esac

ASSET_NAME="${BINARY_NAME}-${PLATFORM}-${ARCH}"

# Get latest release tag
echo "Fetching latest release..."
TAG=$(curl -sL "https://api.github.com/repos/${REPO}/releases/latest" | grep '"tag_name"' | sed -E 's/.*"tag_name": *"([^"]+)".*/\1/')

if [ -z "$TAG" ]; then
  echo "Error: Failed to fetch latest release tag"
  exit 1
fi

DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${TAG}/${ASSET_NAME}"
TMP_FILE="/tmp/${ASSET_NAME}"

echo "Downloading ${BINARY_NAME} ${TAG} (${PLATFORM}/${ARCH})..."
curl -fSL -o "$TMP_FILE" "$DOWNLOAD_URL"

chmod +x "$TMP_FILE"

mkdir -p "$INSTALL_DIR"
mv "$TMP_FILE" "${INSTALL_DIR}/${BINARY_NAME}"

echo ""
echo "${BINARY_NAME} ${TAG} installed to ${INSTALL_DIR}/${BINARY_NAME}"
echo ""

# Check if INSTALL_DIR is in PATH
if [[ ":$PATH:" != *":${INSTALL_DIR}:"* ]]; then
  echo "NOTE: ${INSTALL_DIR} is not in your \$PATH."
  echo "Add it by appending this line to your shell profile (~/.bashrc, ~/.zshrc, etc.):"
  echo ""
  echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
  echo ""
  echo "Then restart your shell or run: source ~/.bashrc"
fi
