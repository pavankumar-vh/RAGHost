import ApiKey from '../models/ApiKey.js';
import { encrypt, decrypt } from '../utils/encryption.js';
import { testPineconeConnection, testGeminiConnection } from '../services/apiTestService.js';

/**
 * @route   POST /api/keys/add
 * @desc    Add or update user's API keys
 */
export const addKeys = async (req, res) => {
  try {
    const userId = req.user.uid;
    const {
      pineconeKey,
      pineconeEnvironment,
      pineconeIndexName,
      geminiKey,
    } = req.body;

    // Validate that at least one key is provided
    if (!pineconeKey && !geminiKey) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least one API key (Pinecone or Gemini)',
      });
    }

    // Prepare update data
    const updateData = {};

    // Encrypt and add Pinecone keys if provided
    if (pineconeKey) {
      if (!pineconeEnvironment || !pineconeIndexName) {
        return res.status(400).json({
          success: false,
          error: 'Pinecone environment and index name are required',
        });
      }
      updateData.pineconeKey = encrypt(pineconeKey);
      updateData.pineconeEnvironment = pineconeEnvironment;
      updateData.pineconeIndexName = pineconeIndexName;
      updateData.pineconeVerified = false; // Reset verification status
    }

    // Encrypt and add Gemini key if provided
    if (geminiKey) {
      updateData.geminiKey = encrypt(geminiKey);
      updateData.geminiVerified = false; // Reset verification status
    }

    // Update or create API keys document
    const apiKeys = await ApiKey.findOneAndUpdate(
      { userId },
      { userId, ...updateData },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'API keys saved successfully',
      data: {
        hasPineconeKey: !!apiKeys.pineconeKey,
        hasGeminiKey: !!apiKeys.geminiKey,
        pineconeVerified: apiKeys.pineconeVerified,
        geminiVerified: apiKeys.geminiVerified,
      },
    });
  } catch (error) {
    console.error('Error saving API keys:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save API keys',
    });
  }
};

/**
 * @route   GET /api/keys
 * @desc    Get user's API keys status (not the actual keys)
 */
export const getKeys = async (req, res) => {
  try {
    const userId = req.user.uid;

    const apiKeys = await ApiKey.findOne({ userId });

    if (!apiKeys) {
      return res.status(404).json({
        success: false,
        error: 'No API keys found for this user',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        hasPineconeKey: !!apiKeys.pineconeKey,
        hasGeminiKey: !!apiKeys.geminiKey,
        pineconeEnvironment: apiKeys.pineconeEnvironment || null,
        pineconeIndexName: apiKeys.pineconeIndexName || null,
        pineconeVerified: apiKeys.pineconeVerified,
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
 * @desc    Test connection to Pinecone and Gemini
 */
export const testConnection = async (req, res) => {
  try {
    const userId = req.user.uid;

    const apiKeys = await ApiKey.findOne({ userId });

    if (!apiKeys) {
      return res.status(404).json({
        success: false,
        error: 'No API keys found. Please add your keys first.',
      });
    }

    const results = {
      pinecone: { success: false, message: '' },
      gemini: { success: false, message: '' },
    };

    // Test Pinecone connection
    if (apiKeys.pineconeKey) {
      try {
        const decryptedPineconeKey = decrypt(apiKeys.pineconeKey);
        const pineconeResult = await testPineconeConnection(
          decryptedPineconeKey,
          apiKeys.pineconeEnvironment,
          apiKeys.pineconeIndexName
        );
        results.pinecone = pineconeResult;
        
        // Update verification status
        apiKeys.pineconeVerified = pineconeResult.success;
      } catch (error) {
        results.pinecone = {
          success: false,
          message: error.message,
        };
        apiKeys.pineconeVerified = false;
      }
    } else {
      results.pinecone.message = 'No Pinecone key configured';
    }

    // Test Gemini connection
    if (apiKeys.geminiKey) {
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
    } else {
      results.gemini.message = 'No Gemini key configured';
    }

    // Update last verified timestamp
    apiKeys.lastVerified = new Date();
    await apiKeys.save();

    const overallSuccess = 
      (apiKeys.pineconeKey ? results.pinecone.success : true) &&
      (apiKeys.geminiKey ? results.gemini.success : true);

    res.status(200).json({
      success: overallSuccess,
      message: overallSuccess 
        ? 'All configured API connections successful' 
        : 'Some API connections failed',
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
