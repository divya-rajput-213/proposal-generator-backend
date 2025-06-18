#!/bin/bash

# Curl-based tests for the Proposal Generator Backend
# Make sure the server is running before executing this script

BASE_URL="http://localhost:3000"

echo "🚀 Testing Proposal Generator Backend with cURL"
echo "================================================"

# Test 1: Health Check
echo ""
echo "🔍 Testing Health Check..."
curl -s -X GET "$BASE_URL/health" | jq '.'

# Test 2: File Upload
echo ""
echo "📄 Testing File Upload..."
curl -s -X POST "$BASE_URL/api/files/upload" \
  -F "document=@test-examples/test-document.txt" | jq '.'

# Test 3: Generate Proposal (Description Only)
echo ""
echo "💡 Testing Proposal Generation (Description Only)..."
curl -s -X POST "$BASE_URL/api/proposals/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Create a proposal for developing a restaurant management system with inventory tracking, staff scheduling, and customer ordering features.",
    "customization": {
      "backgroundColor": "#f7fafc",
      "textColor": "#2d3748"
    }
  }' | jq '.'

# Test 4: Generate Proposal with Custom Colors
echo ""
echo "🎨 Testing Proposal with Custom Colors..."
curl -s -X POST "$BASE_URL/api/proposals/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Develop a fitness tracking mobile app with workout plans, progress tracking, and social features.",
    "customization": {
      "backgroundColor": "#1a202c",
      "textColor": "#f7fafc"
    }
  }' | jq '.'

# Test 5: Error Test - No Content
echo ""
echo "❌ Testing Error Handling (No Content)..."
curl -s -X POST "$BASE_URL/api/proposals/generate" \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.'

echo ""
echo "✨ cURL tests completed!"