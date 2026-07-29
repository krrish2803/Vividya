import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import logger from '../utils/logger.js';

export const extractTextFromPDF = async (fileBuffer) => {
  try {
    const data = await pdfParse(fileBuffer);
    logger.info(`PDF text extracted: ${data.text.length} characters`);
    return data.text;
  } catch (error) {
    logger.error(`PDF extraction failed: ${error.message}`);
    throw error;
  }
};

export const extractTextFromImage = async (fileBuffer) => {
  try {
    const processedBuffer = await sharp(fileBuffer)
      .resize(2000, null, { withoutEnlargement: true })
      .grayscale()
      .toBuffer();

    const { data } = await Tesseract.recognize(processedBuffer, 'eng+hin', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          logger.info(`OCR progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    logger.info(`Image OCR extracted: ${data.text.length} characters`);
    return data.text;
  } catch (error) {
    logger.error(`Image OCR failed: ${error.message}`);
    throw error;
  }
};

export const extractText = async (fileBuffer, fileType) => {
  switch (fileType) {
    case 'pdf':
      return extractTextFromPDF(fileBuffer);
    case 'image':
      return extractTextFromImage(fileBuffer);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
};
