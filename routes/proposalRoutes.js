const express = require('express');
const { generateProposal } = require('../services/aiService');
const { validateProposalRequest } = require('../middleware/validation');

const router = express.Router();

// Generate proposal endpoint
router.post('/generate', validateProposalRequest, async (req, res) => {
  try {
    const { description, extractedText, customization } = req.body;
    
    // Combine description and extracted text for context
    const contextText = [
      description && `Description: ${description}`,
      extractedText && `Document Content: ${extractedText}`
    ].filter(Boolean).join('\n\n');

    if (!contextText.trim()) {
      return res.status(400).json({
        error: 'No content provided',
        message: 'Please provide either a description or upload a document'
      });
    }

    // Generate proposal using AI
    const proposalSlides = await generateProposal(contextText, customization);

    res.status(200).json({
      success: true,
      message: 'Proposal generated successfully',
      data: proposalSlides
    });

  } catch (error) {
    console.error('Proposal generation error:', error);
    res.status(500).json({
      error: 'Proposal generation failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;