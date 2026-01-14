import axios from "axios";

// MyMemory Translation API - Free, no API key required
// Free tier: 1000 requests per day
// Docs: https://mymemory.translated.net/doc/spec.php

/**
 * Translate text using OpenAI GPT
 * POST /api/translate
 * Body: { text: string, targetLanguage: string }
 * Returns: { translatedText: string, originalText: string, targetLanguage: string }
 */
export const translateText = async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    // Validation
    if (!text || !targetLanguage) {
      return res.status(400).json({ 
        message: "Text and target language are required" 
      });
    }

    if (text.trim().length === 0) {
      return res.status(400).json({ 
        message: "Text cannot be empty" 
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({ 
        message: "Text is too long. Maximum 5000 characters allowed." 
      });
    }

    // Map common language names to ISO 639-1 codes
    const languageMap = {
      'spanish': 'es',
      'french': 'fr',
      'german': 'de',
      'italian': 'it',
      'portuguese': 'pt',
      'russian': 'ru',
      'japanese': 'ja',
      'chinese': 'zh',
      'korean': 'ko',
      'arabic': 'ar',
      'hindi': 'hi',
      'dutch': 'nl',
      'polish': 'pl',
      'turkish': 'tr',
      'swedish': 'sv',
      'norwegian': 'no',
      'danish': 'da',
      'finnish': 'fi',
      'greek': 'el',
      'czech': 'cs',
      'romanian': 'ro',
      'hungarian': 'hu',
      'thai': 'th',
      'vietnamese': 'vi',
      'indonesian': 'id',
      'malay': 'ms',
      'hebrew': 'he',
      'ukrainian': 'uk',
    };

    // Convert language name to code
    const langCode = languageMap[targetLanguage.toLowerCase()] || targetLanguage.toLowerCase();

    // Call MyMemory Translation API
    const response = await axios.get('https://api.mymemory.translated.net/get', {
      params: {
        q: text,
        langpair: `en|${langCode}`,
      },
      timeout: 10000, // 10 second timeout
    });

    // Check API response
    if (response.data.responseStatus !== 200) {
      throw new Error(response.data.responseDetails || 'Translation failed');
    }

    const translatedText = response.data.responseData.translatedText;

    // Success response
    res.status(200).json({
      success: true,
      translatedText,
      originalText: text,
      targetLanguage,
    });

  } catch (error) {
    console.error("Error in translateText controller:", error);
    
    // Handle specific API errors
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ 
        message: "Translation request timed out. Please try again." 
      });
    }
    
    if (error.response?.status === 429) {
      return res.status(429).json({ 
        message: "Translation service rate limit exceeded. Please try again later." 
      });
    }

    if (error.response?.status === 403) {
      return res.status(429).json({ 
        message: "Daily translation limit reached (1000/day). Please try again tomorrow." 
      });
    }

    // Generic error
    res.status(500).json({ 
      message: error.message || "Failed to translate text. Please try again." 
    });
  }
};
