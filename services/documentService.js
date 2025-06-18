const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract text from various document types
 * @param {string} filePath - Path to the document
 * @param {string} mimeType - MIME type of the document
 * @returns {Promise<string>} - Extracted text content
 */
async function extractTextFromFile(filePath, mimeType) {
  try {
    const fileBuffer = await fs.readFile(filePath);
    
    switch (mimeType) {
      case 'application/pdf':
        return await extractTextFromPDF(fileBuffer);
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/msword':
        return await extractTextFromWord(fileBuffer);
      
      case 'text/plain':
        return fileBuffer.toString('utf-8');
      
      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error(`Failed to extract text from document: ${error.message}`);
  }
}

/**
 * Extract text from PDF files
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (error) {
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
}

/**
 * Extract text from Word documents
 * @param {Buffer} buffer - Word document buffer
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromWord(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  } catch (error) {
    throw new Error(`Word document parsing failed: ${error.message}`);
  }
}

module.exports = {
  extractTextFromFile,
  extractTextFromPDF,
  extractTextFromWord
};