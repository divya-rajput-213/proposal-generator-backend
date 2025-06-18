# Proposal Generator Backend

A Node.js backend service that processes documents (PDF, DOC, TXT) and generates professional proposals using Google's Gemini 2.0 Flash AI model.

## Features

- 📄 **Document Processing**: Upload and extract text from PDF, DOC, DOCX, and TXT files
- 🤖 **AI-Powered Proposals**: Generate professional proposals using Gemini 2.0 Flash
- 🎨 **Customizable Output**: Support for custom background and text colors
- 🛡️ **Security**: Rate limiting, file validation, and secure file handling
- 📊 **PPT-Ready Output**: Structured JSON response perfect for presentation creation

## Quick Start

### 1. Get Your Free Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file and add your Gemini API key
GEMINI_API_KEY=your_api_key_here
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### 1. File Upload & Processing

**POST** `/api/files/upload`

Upload a document and extract text content.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: Form data with 'document' field containing the file

**Supported File Types:**
- PDF (.pdf)
- Word Documents (.doc, .docx)
- Text Files (.txt)
- Max file size: 10MB

**Response:**
```json
{
  "success": true,
  "message": "File processed successfully",
  "data": {
    "filename": "document.pdf",
    "size": 1024,
    "extractedText": "Document content here...",
    "textLength": 500
  }
}
```

### 2. Generate Proposal

**POST** `/api/proposals/generate`

Generate a professional proposal from text content.

**Request:**
```json
{
  "description": "Optional description text",
  "extractedText": "Text extracted from uploaded document",
  "customization": {
    "backgroundColor": "#ffffff",
    "textColor": "#333333"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Proposal generated successfully",
  "data": [
    {
      "id": "uuid-string",
      "title": "Proposal Title",
      "content": "Slide content...",
      "bulletPoints": ["Point 1", "Point 2"],
      "template": "title",
      "backgroundColor": "#ffffff",
      "textColor": "#333333"
    }
  ]
}
```

### 3. Health Check

**GET** `/health`

Check if the server is running.

**Response:**
```json
{
  "status": "OK",
  "message": "Proposal Generator Backend is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Usage Examples

### Using cURL

**Upload a document:**
```bash
curl -X POST \
  http://localhost:3000/api/files/upload \
  -F "document=@/path/to/your/document.pdf"
```

**Generate a proposal:**
```bash
curl -X POST \
  http://localhost:3000/api/proposals/generate \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Create a proposal for mobile app development",
    "customization": {
      "backgroundColor": "#f0f8ff",
      "textColor": "#1e3a8a"
    }
  }'
```

### Using JavaScript (Frontend)

```javascript
// Upload a file
const formData = new FormData();
formData.append('document', fileInput.files[0]);

const uploadResponse = await fetch('http://localhost:3000/api/files/upload', {
  method: 'POST',
  body: formData
});

const uploadResult = await uploadResponse.json();

// Generate proposal
const proposalResponse = await fetch('http://localhost:3000/api/proposals/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    extractedText: uploadResult.data.extractedText,
    description: 'Additional context...',
    customization: {
      backgroundColor: '#ffffff',
      textColor: '#000000'
    }
  })
});

const proposalData = await proposalResponse.json();
console.log(proposalData.data); // Array of slides for PPT creation
```

## Slide Templates

The API returns slides with different templates:

- **title**: Title slide (large heading)
- **content**: Content slide with paragraph text
- **bullets**: Bullet point slide with list items

## Security Features

- Rate limiting (100 requests per 15 minutes per IP)
- File type validation
- File size limits (10MB)
- Automatic file cleanup after processing
- Input validation and sanitization

## Error Handling

The API returns structured error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

Common error codes:
- 400: Bad Request (invalid input, file too large)
- 429: Too Many Requests (rate limit exceeded)
- 500: Internal Server Error

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Your Gemini AI API key | Required |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment mode | development |

## Free Resources Used

- **Google Gemini 2.0 Flash**: Free AI model for proposal generation
- **Node.js**: Free runtime environment
- **Express.js**: Free web framework
- **All dependencies**: Free and open-source libraries

## Limitations

- Gemini API has daily usage limits (generous free tier)
- File size limited to 10MB
- Only proposal-related content generation
- Rate limiting applied for fair usage

## Troubleshooting

**"GEMINI_API_KEY not found"**
- Make sure you've created a `.env` file with your API key
- Verify the API key is correct and active

**"File too large"**
- Reduce file size to under 10MB
- Consider splitting large documents

**"Rate limit exceeded"**
- Wait 15 minutes before making more requests
- Increase rate limits in production if needed