#!/bin/bash

# AI News Aggregator - Complete Setup Script

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Setting up AI News Aggregator in: $PROJECT_DIR"

# Create directory structure
mkdir -p "$PROJECT_DIR/backend/src/main/java/com/newsagg/{controller,service,entity,repository,ai/{summarizer,sentiment,categorizer,embeddings},dto,config}"
mkdir -p "$PROJECT_DIR/backend/src/main/resources"
mkdir -p "$PROJECT_DIR/backend/src/test/java/com/newsagg"
mkdir -p "$PROJECT_DIR/frontend/src/{components,pages,api}"

echo "✅ Directory structure created"

cd "$PROJECT_DIR"
echo "✅ Setup complete! Next steps:"
echo ""
echo "Backend setup:"
echo "  cd backend"
echo "  mvn clean install"
echo "  mvn spring-boot:run"
echo ""
echo "Frontend setup (in another terminal):"
echo "  cd frontend"
echo "  npm install"
echo "  npm run dev"

