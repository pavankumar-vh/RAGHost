import ApiKey from '../models/ApiKey.js';
import { encrypt, decrypt } from '../utils/encryption.js';
import { testPineconeConnection, testGeminiConnection } from '../services/apiTestService.js';

/**
 * @route   POST /api/keys/add
 * @desc    Add or update user's global Gemini API key
 */
export const addKeys = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { geminiKey } = req.body;

    // Validate that Gemini key is provided
    if (!geminiKey) {
      return res.status(400).json({
        success: false,
        error: 'Please provide your Gemini API key',
      });
    }

    // Prepare update data
    const updateData = {
      geminiKey: encrypt(geminiKey),
      geminiVerified: false, // Reset verification status
    };

    // Update or create API keys document
    const apiKeys = await ApiKey.findOneAndUpdate(
      { userId },
      { userId, ...updateData },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Global Gemini API key saved successfully',
      data: {
        hasGeminiKey: !!apiKeys.geminiKey,
        geminiVerified: apiKeys.geminiVerified,
      },
    });
  } catch (error) {
    console.error('Error saving API key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save API key',
    });
  }
};

/**
 * @route   GET /api/keys
 * @desc    Get user's global Gemini API key status
 */
export const getKeys = async (req, res) => {
  try {
    const userId = req.user.uid;

    const apiKeys = await ApiKey.findOne({ userId });

    if (!apiKeys) {
      return res.status(200).json({
        success: true,
        data: {
          hasKeys: false,
          hasGeminiKey: false,
          geminiVerified: false,
          lastVerified: null,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        hasKeys: !!apiKeys.geminiKey,
        hasGeminiKey: !!apiKeys.geminiKey,
        geminiVerified: apiKeys.geminiVerified,
        lastVerified: apiKeys.lastVerified || null,
        updatedAt: apiKeys.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch API keys',
    });
  }
};

/**
 * @route   POST /api/keys/test
 * @desc    Test connection to Gemini
 */
export const testConnection = async (req, res) => {
  try {
    const userId = req.user.uid;

    const apiKeys = await ApiKey.findOne({ userId });

    if (!apiKeys || !apiKeys.geminiKey) {
      return res.status(404).json({
        success: false,
        error: 'No Gemini API key found. Please add your key first.',
      });
    }

    const results = {
      gemini: { success: false, message: '' },
    };

    // Test Gemini connection
    try {
      const decryptedGeminiKey = decrypt(apiKeys.geminiKey);
      const geminiResult = await testGeminiConnection(decryptedGeminiKey);
      results.gemini = geminiResult;
      
      // Update verification status
      apiKeys.geminiVerified = geminiResult.success;
    } catch (error) {
      results.gemini = {
        success: false,
        message: error.message,
      };
      apiKeys.geminiVerified = false;
    }

    // Update last verified timestamp
    apiKeys.lastVerified = new Date();
    await apiKeys.save();

    res.status(200).json({
      success: results.gemini.success,
      message: results.gemini.success 
        ? 'Gemini API connection successful' 
        : 'Gemini API connection failed',
      data: results,
    });
  } catch (error) {
    console.error('Error testing connections:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test API connections',
    });
  }
};

/**
 * @route   DELETE /api/keys
 * @desc    Delete user's API keys
 */
export const deleteKeys = async (req, res) => {
  try {
    const userId = req.user.uid;

    const result = await ApiKey.findOneAndDelete({ userId });

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'No API keys found for this user',
      });
    }

    res.status(200).json({
      success: true,
      message: 'API keys deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting API keys:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete API keys',
    });
  }
};
