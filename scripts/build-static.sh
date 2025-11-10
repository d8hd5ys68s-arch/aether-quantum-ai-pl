#!/bin/bash
#
# Build script for static GitHub Pages export
# Temporarily moves API routes since they're not supported in static export
#

set -e

echo "🚀 Starting static build..."

# Move API routes out of the app directory
if [ -d "app/api" ]; then
  echo "📦 Temporarily moving API routes..."
  mv app/api /tmp/api-backup-$$
fi

# Build static site
echo "🔨 Building static site..."
BUILD_MODE=static next build

# Restore API routes
if [ -d "/tmp/api-backup-$$" ]; then
  echo "📦 Restoring API routes..."
  mv /tmp/api-backup-$$ app/api
fi

echo "✅ Static build complete! Output in /out directory"
