const { GoogleGenerativeAI } = require('@google/generative-ai');
const { v4: uuidv4 } = require('uuid');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI("AIzaSyBujEHcmoSkI7FcvieqXAVbuWS8yRO5zq8");

/**
 * Generate proposal slides using Gemini AI
 * @param {string} contextText - Combined description and document text
 * @param {Object} customization - UI customization options (optional, for backward compatibility)
 * @returns {Promise<Array>} - Array of proposal slides
 */
async function generateProposal(contextText, customization = {}) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const prompt = createProposalPrompt(contextText);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the AI response and format as slides
    return parseProposalResponse(text);
    
  } catch (error) {
    console.error('AI service error:', error);
    throw new Error(`AI proposal generation failed: ${error.message}`);
  }
}

/**
 * Create a structured prompt for proposal generation with intelligent color handling
 * @param {string} contextText - Input context
 * @returns {string} - Formatted prompt
 */
function createProposalPrompt(contextText) {
  return `
You are a professional proposal writer and presentation designer. Based on the provided context, create a comprehensive business proposal with appropriate visual styling.

STRICT RULES:
1. ONLY create proposal-related content
2. DO NOT answer questions outside of proposal generation
3. If the content is not suitable for a proposal, respond with "This content is not suitable for proposal generation"
4. Focus on business value, solutions, and professional presentation
5. Choose appropriate colors based on the context and any color preferences mentioned

Context to work with:
${contextText}

IMPORTANT COLOR INSTRUCTIONS:
- Analyze the context for any color preferences (e.g., "blue background", "dark theme", "corporate colors", "colorful", etc.)
- If specific colors are mentioned, use them appropriately
- If no colors are mentioned, choose professional defaults
- Ensure good contrast between background and text colors
- Use hex color codes (e.g., #1e40af for blue, #ffffff for white)

Common color combinations:
- Blue theme: backgroundColor: "#1e40af", textColor: "#ffffff"
- Dark theme: backgroundColor: "#1f2937", textColor: "#f9fafb"
- Corporate: backgroundColor: "#374151", textColor: "#ffffff"
- Clean/White: backgroundColor: "#ffffff", textColor: "#1f2937"
- Green: backgroundColor: "#059669", textColor: "#ffffff"
- Purple: backgroundColor: "#7c3aed", textColor: "#ffffff"

Create a structured proposal with 5-7 slides covering:
1. Title slide with compelling headline
2. Problem statement or opportunity
3. Proposed solution overview
4. Key benefits and value proposition
5. Implementation approach
6. Timeline or next steps
7. Call to action

IMPORTANT: Respond with ONLY a JSON array of slides in this exact format:
[
  {
    "title": "Slide Title Here",
    "content": "Main content paragraph here",
    "bulletPoints": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
    "template": "title",
    "backgroundColor": "#1e40af",
    "textColor": "#ffffff"
  },
  {
    "title": "Another Slide Title",
    "content": "Content for this slide",
    "bulletPoints": [],
    "template": "content",
    "backgroundColor": "#1e40af",
    "textColor": "#ffffff"
  }
]

Template options: "title", "content", "bullets"
- Use "title" for the first slide
- Use "bullets" when you have bullet points
- Use "content" for paragraph content

CRITICAL: Each slide MUST include backgroundColor and textColor fields with appropriate hex color codes.

Do NOT include any markdown formatting, code blocks, or explanatory text. Return ONLY the JSON array.
`;
}

/**
 * Parse AI response and format as presentation slides
 * @param {string} aiResponse - Raw AI response
 * @returns {Array} - Formatted slides array
 */
function parseProposalResponse(aiResponse) {
  try {
    // Check if the AI refused to generate a proposal
    if (aiResponse.toLowerCase().includes('not suitable for proposal generation')) {
      throw new Error('The provided content is not suitable for proposal generation. Please provide business-related information.');
    }

    let parsedData;
    
    // Try to extract JSON from the response
    try {
      // First, try to parse as direct JSON
      parsedData = JSON.parse(aiResponse);
    } catch (directParseError) {
      // If that fails, try to extract JSON from markdown code blocks
      const jsonMatch = aiResponse.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[1]);
      } else {
        // Try to find JSON array in the text
        const arrayMatch = aiResponse.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          parsedData = JSON.parse(arrayMatch[0]);
        } else {
          throw new Error('No valid JSON found in response');
        }
      }
    }

    // Validate and format the parsed data
    if (!Array.isArray(parsedData)) {
      throw new Error('Response is not an array of slides');
    }

    const slides = parsedData.map((slide, index) => {
      // Ensure required fields exist
      const formattedSlide = {
        id: uuidv4(),
        title: slide.title || `Slide ${index + 1}`,
        content: slide.content || '',
        bulletPoints: Array.isArray(slide.bulletPoints) ? slide.bulletPoints : [],
        template: slide.template || (index === 0 ? 'title' : 'content'),
        // Use AI-provided colors or fallback to professional defaults
        backgroundColor: slide.backgroundColor || '#1f2937',
        textColor: slide.textColor || '#f9fafb'
      };

      // Validate template
      const validTemplates = ['title', 'content', 'bullets', 'image'];
      if (!validTemplates.includes(formattedSlide.template)) {
        formattedSlide.template = 'content';
      }

      // If template is bullets but no bullet points, switch to content
      if (formattedSlide.template === 'bullets' && formattedSlide.bulletPoints.length === 0) {
        formattedSlide.template = 'content';
      }

      // Validate color formats
      if (!isValidHexColor(formattedSlide.backgroundColor)) {
        formattedSlide.backgroundColor = '#1f2937';
      }
      if (!isValidHexColor(formattedSlide.textColor)) {
        formattedSlide.textColor = '#f9fafb';
      }

      return formattedSlide;
    });

    // Ensure we have at least one slide
    if (slides.length === 0) {
      slides.push({
        id: uuidv4(),
        title: 'Generated Proposal',
        content: 'Proposal content generated from your input.',
        bulletPoints: [],
        template: 'title',
        backgroundColor: '#1f2937',
        textColor: '#f9fafb'
      });
    }

    return slides;

  } catch (error) {
    console.error('Response parsing error:', error);
    console.log('Raw AI Response:', aiResponse);
    
    // Fallback: Create slides from the raw response
    return createFallbackSlides(aiResponse);
  }
}

/**
 * Validate hex color format
 * @param {string} color - Color string to validate
 * @returns {boolean} - Whether the color is a valid hex color
 */
function isValidHexColor(color) {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Create fallback slides when parsing fails
 * @param {string} rawResponse - Raw AI response
 * @returns {Array} - Fallback slides
 */
function createFallbackSlides(rawResponse) {
  // Try to extract meaningful content from the response
  const lines = rawResponse.split('\n').filter(line => line.trim());
  const slides = [];

  // Create title slide
  slides.push({
    id: uuidv4(),
    title: 'Business Proposal',
    content: 'Generated from your document and requirements',
    bulletPoints: [],
    template: 'title',
    backgroundColor: '#1f2937',
    textColor: '#f9fafb'
  });

  // Try to create content slides from the response
  let currentSlide = null;
  let bulletPoints = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines and code block markers
    if (!trimmedLine || trimmedLine.startsWith('```')) continue;
    
    // Check if this looks like a heading
    if (trimmedLine.length < 100 && (
      trimmedLine.endsWith(':') || 
      trimmedLine.match(/^\d+\./) ||
      trimmedLine.match(/^[A-Z][^.!?]*$/)
    )) {
      // Save previous slide if exists
      if (currentSlide) {
        currentSlide.bulletPoints = bulletPoints;
        slides.push(currentSlide);
      }
      
      // Start new slide
      currentSlide = {
        id: uuidv4(),
        title: trimmedLine.replace(/^\d+\.\s*/, '').replace(/:$/, ''),
        content: '',
        bulletPoints: [],
        template: 'content',
        backgroundColor: '#1f2937',
        textColor: '#f9fafb'
      };
      bulletPoints = [];
    } else if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
      // This is a bullet point
      bulletPoints.push(trimmedLine.replace(/^[•\-*]\s*/, ''));
    } else if (currentSlide && trimmedLine.length > 20) {
      // This is content
      currentSlide.content += (currentSlide.content ? ' ' : '') + trimmedLine;
    }
  }

  // Add the last slide
  if (currentSlide) {
    currentSlide.bulletPoints = bulletPoints;
    if (bulletPoints.length > 0) {
      currentSlide.template = 'bullets';
    }
    slides.push(currentSlide);
  }

  // If we still don't have enough slides, create a basic one
  if (slides.length === 1) {
    slides.push({
      id: uuidv4(),
      title: 'Proposal Details',
      content: rawResponse.substring(0, 500) + (rawResponse.length > 500 ? '...' : ''),
      bulletPoints: [],
      template: 'content',
      backgroundColor: '#1f2937',
      textColor: '#f9fafb'
    });
  }

  return slides;
}

module.exports = {
  generateProposal
};