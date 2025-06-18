// Test script for the Proposal Generator Backend
// Run this after starting the server with: node test-examples/test-requests.js

const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

// Test 1: Health Check
async function testHealthCheck() {
  console.log('\n🔍 Testing Health Check...');
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    console.log('✅ Health Check:', data);
  } catch (error) {
    console.error('❌ Health Check failed:', error.message);
  }
}

// Test 2: File Upload
async function testFileUpload() {
  console.log('\n📄 Testing File Upload...');
  try {
    const formData = new FormData();
    const fileContent = fs.readFileSync(path.join(__dirname, 'test-document.txt'));
    const blob = new Blob([fileContent], { type: 'text/plain' });
    formData.append('document', blob, 'test-document.txt');

    const response = await fetch(`${BASE_URL}/api/files/upload`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    console.log('✅ File Upload:', data);
    return data.data?.extractedText;
  } catch (error) {
    console.error('❌ File Upload failed:', error.message);
    return null;
  }
}

// Test 3: Generate Proposal (Description Only)
async function testProposalWithDescription() {
  console.log('\n💡 Testing Proposal Generation (Description Only)...');
  try {
    const response = await fetch(`${BASE_URL}/api/proposals/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: "Create a proposal for developing a mobile e-commerce app for a clothing store. The app should have product catalog, shopping cart, payment integration, and user profiles.",
        customization: {
          backgroundColor: "#f0f8ff",
          textColor: "#1e3a8a"
        }
      })
    });

    const data = await response.json();
    console.log('✅ Proposal (Description Only):', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Proposal generation failed:', error.message);
  }
}

// Test 4: Generate Proposal (File Only)
async function testProposalWithFile(extractedText) {
  if (!extractedText) {
    console.log('\n⚠️ Skipping file-only test (no extracted text)');
    return;
  }

  console.log('\n📋 Testing Proposal Generation (File Only)...');
  try {
    const response = await fetch(`${BASE_URL}/api/proposals/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        extractedText: extractedText,
        customization: {
          backgroundColor: "#ffffff",
          textColor: "#333333"
        }
      })
    });

    const data = await response.json();
    console.log('✅ Proposal (File Only):', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Proposal generation failed:', error.message);
  }
}

// Test 5: Generate Proposal (Both Description and File)
async function testProposalWithBoth(extractedText) {
  if (!extractedText) {
    console.log('\n⚠️ Skipping combined test (no extracted text)');
    return;
  }

  console.log('\n🔄 Testing Proposal Generation (Description + File)...');
  try {
    const response = await fetch(`${BASE_URL}/api/proposals/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: "Additional context: Focus on modern UI/UX design and ensure the app is scalable for future expansion.",
        extractedText: extractedText,
        customization: {
          backgroundColor: "#2d3748",
          textColor: "#ffffff"
        }
      })
    });

    const data = await response.json();
    console.log('✅ Proposal (Both):', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Proposal generation failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Backend Tests...');
  console.log('Make sure the server is running on http://localhost:3000');
  
  await testHealthCheck();
  const extractedText = await testFileUpload();
  await testProposalWithDescription();
  await testProposalWithFile(extractedText);
  await testProposalWithBoth(extractedText);
  
  console.log('\n✨ All tests completed!');
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ This test requires Node.js 18+ or you need to install node-fetch');
  console.log('Install node-fetch: npm install node-fetch');
  process.exit(1);
}

runAllTests().catch(console.error);