/**
 * Validate proposal generation request
 */
function validateProposalRequest(req, res, next) {
  const { description, extractedText, customization } = req.body;
  
  // Check if at least one content source is provided
  if (!description && !extractedText) {
    return res.status(400).json({
      error: 'Missing content',
      message: 'Please provide either a description or upload a document'
    });
  }

  // Validate customization object if provided
  if (customization && typeof customization !== 'object') {
    return res.status(400).json({
      error: 'Invalid customization',
      message: 'Customization must be an object'
    });
  }

  // Validate color formats if provided
  if (customization) {
    const { backgroundColor, textColor } = customization;
    
    if (backgroundColor && !isValidColor(backgroundColor)) {
      return res.status(400).json({
        error: 'Invalid background color',
        message: 'Background color must be a valid hex color or CSS color name'
      });
    }
    
    if (textColor && !isValidColor(textColor)) {
      return res.status(400).json({
        error: 'Invalid text color',
        message: 'Text color must be a valid hex color or CSS color name'
      });
    }
  }

  next();
}

/**
 * Basic color validation (hex colors and common CSS color names)
 */
function isValidColor(color) {
  // Check hex colors
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
    return true;
  }
  
  // Check common CSS color names
  const cssColors = [
    'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown',
    'black', 'white', 'gray', 'grey', 'cyan', 'magenta', 'lime', 'navy',
    'maroon', 'olive', 'teal', 'silver', 'gold', 'transparent'
  ];
  
  return cssColors.includes(color.toLowerCase());
}

module.exports = {
  validateProposalRequest
};