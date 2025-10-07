import Bot from '../models/Bot.js';
import { encrypt, decrypt } from '../utils/encryption.js';

// Create a new bot
export const createBot = async (req, res) => {
  try {
    const { name, type, description, color, pineconeKey, pineconeEnvironment, pineconeIndexName, geminiKey } = req.body;
    const userId = req.user.uid;

    // Validation
    if (!name || !type) {
      return res.status(400).json({ error: 'Bot name and type are required' });
    }

    if (!pineconeKey || !pineconeEnvironment || !pineconeIndexName) {
      return res.status(400).json({ error: 'Pinecone configuration (API key, environment, index name) is required for each bot' });
    }

    if (!geminiKey) {
      return res.status(400).json({ error: 'Gemini API key is required for each bot' });
    }

    // Encrypt API keys
    const encryptedPineconeKey = encrypt(pineconeKey);
    const encryptedGeminiKey = encrypt(geminiKey);

    // Verify API keys before creating bot
    let pineconeVerified = false;
    let geminiVerified = false;
    const verificationErrors = [];

    // Test Pinecone connection
    try {
      console.log('🔍 Verifying Pinecone connection...');
      console.log(`   Index: ${pineconeIndexName}, Environment: ${pineconeEnvironment}`);
      
      // Try modern Pinecone URL format first (projects-based)
      // Format: https://INDEX_NAME-PROJECT_ID.svc.ENVIRONMENT.pinecone.io
      let pineconeUrl = `https://${pineconeIndexName}-${pineconeEnvironment}.svc.pinecone.io/describe_index_stats`;
      
      // If environment looks like a region (e.g., us-east-1-aws), try alternate format
      if (pineconeEnvironment.includes('-')) {
        // Legacy format: https://INDEX_NAME.svc.ENVIRONMENT.pinecone.io
        pineconeUrl = `https://${pineconeIndexName}.svc.${pineconeEnvironment}.pinecone.io/describe_index_stats`;
      }
      
      console.log(`   Testing URL: ${pineconeUrl}`);
      
      const pineconeResponse = await fetch(pineconeUrl, {
        method: 'GET',
        headers: {
          'Api-Key': pineconeKey,
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`   Response status: ${pineconeResponse.status}`);
      
      if (pineconeResponse.ok) {
        const data = await pineconeResponse.json();
        pineconeVerified = true;
        console.log('✅ Pinecone verified - Dimension:', data.dimension, 'Vectors:', data.totalVectorCount);
      } else {
        const errorText = await pineconeResponse.text();
        verificationErrors.push(`Pinecone verification failed: ${pineconeResponse.status} - ${errorText.substring(0, 100)}`);
        console.log('❌ Pinecone verification failed:', pineconeResponse.status, errorText.substring(0, 200));
      }
    } catch (error) {
      verificationErrors.push(`Pinecone error: ${error.message}`);
      console.log('❌ Pinecone error:', error.message);
    }

    // Test Gemini connection
    try {
      console.log('🔍 Verifying Gemini connection...');
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`;
      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'Hi' }]
          }]
        }),
      });
      
      console.log(`   Response status: ${geminiResponse.status}`);
      
      if (geminiResponse.ok) {
        geminiVerified = true;
        console.log('✅ Gemini verified');
      } else {
        const errorData = await geminiResponse.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || geminiResponse.statusText;
        verificationErrors.push(`Gemini verification failed: ${errorMsg}`);
        console.log('❌ Gemini verification failed:', geminiResponse.status, errorMsg);
      }
    } catch (error) {
      verificationErrors.push(`Gemini error: ${error.message}`);
      console.log('❌ Gemini error:', error.message);
    }

    // Determine bot status based on verification
    const status = (pineconeVerified && geminiVerified) ? 'active' : 'inactive';

    // Construct and store pineconeHost for easier access
    let pineconeHost;
    if (pineconeEnvironment.includes('-')) {
      pineconeHost = `https://${pineconeIndexName}.svc.${pineconeEnvironment}.pinecone.io`;
    } else {
      pineconeHost = `https://${pineconeIndexName}-${pineconeEnvironment}.svc.pinecone.io`;
    }

    // Create bot
    const bot = new Bot({
      userId,
      name,
      type,
      description,
      color: color || 'blue',
      pineconeKey: encryptedPineconeKey,
      pineconeEnvironment,
      pineconeIndexName,
      pineconeHost,
      geminiKey: encryptedGeminiKey,
      pineconeVerified,
      geminiVerified,
      status,
      lastVerified: new Date(),
    });

    await bot.save();

    console.log(`🤖 Bot created: ${bot.name} (Status: ${status})`);

    // Return bot without sensitive data
    const botResponse = {
      id: bot._id,
      name: bot.name,
      type: bot.type,
      description: bot.description,
      status: bot.status,
      color: bot.color,
      pineconeEnvironment: bot.pineconeEnvironment,
      pineconeIndexName: bot.pineconeIndexName,
      pineconeVerified: bot.pineconeVerified,
      geminiVerified: bot.geminiVerified,
      totalQueries: bot.totalQueries,
      avgResponseTime: bot.avgResponseTime,
      accuracy: bot.accuracy,
      createdAt: bot.createdAt,
    };

    res.status(201).json({
      message: 'Bot created successfully',
      bot: botResponse,
      verificationStatus: {
        pinecone: pineconeVerified ? 'verified' : 'failed',
        gemini: geminiVerified ? 'verified' : 'failed',
        errors: verificationErrors.length > 0 ? verificationErrors : undefined,
      },
    });
  } catch (error) {
    console.error('Error creating bot:', error);
    res.status(500).json({ error: 'Failed to create bot' });
  }
};

// Get all bots for a user
export const getBots = async (req, res) => {
  try {
    const userId = req.user.uid;

    const bots = await Bot.find({ userId }).sort({ createdAt: -1 });

    // Return bots without sensitive data
    const botsResponse = bots.map((bot) => ({
      id: bot._id,
      name: bot.name,
      type: bot.type,
      description: bot.description,
      status: bot.status,
      color: bot.color,
      pineconeEnvironment: bot.pineconeEnvironment,
      pineconeIndexName: bot.pineconeIndexName,
      pineconeVerified: bot.pineconeVerified,
      geminiVerified: bot.geminiVerified,
      totalQueries: bot.totalQueries,
      avgResponseTime: bot.avgResponseTime,
      accuracy: bot.accuracy,
      createdAt: bot.createdAt,
      updatedAt: bot.updatedAt,
    }));

    res.json({ bots: botsResponse });
  } catch (error) {
    console.error('Error fetching bots:', error);
    res.status(500).json({ error: 'Failed to fetch bots' });
  }
};

// Get single bot by ID
export const getBotById = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;

    const bot = await Bot.findOne({ _id: id, userId });

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    const botResponse = {
      id: bot._id,
      name: bot.name,
      type: bot.type,
      description: bot.description,
      status: bot.status,
      color: bot.color,
      pineconeEnvironment: bot.pineconeEnvironment,
      pineconeIndexName: bot.pineconeIndexName,
      pineconeVerified: bot.pineconeVerified,
      geminiVerified: bot.geminiVerified,
      totalQueries: bot.totalQueries,
      avgResponseTime: bot.avgResponseTime,
      accuracy: bot.accuracy,
      createdAt: bot.createdAt,
      updatedAt: bot.updatedAt,
    };

    res.json({ bot: botResponse });
  } catch (error) {
    console.error('Error fetching bot:', error);
    res.status(500).json({ error: 'Failed to fetch bot' });
  }
};

// Update bot
export const updateBot = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    const { name, type, description, color, pineconeKey, pineconeEnvironment, pineconeIndexName, geminiKey, useGlobalGeminiKey, status } = req.body;

    const bot = await Bot.findOne({ _id: id, userId });

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    // Update fields
    if (name) bot.name = name;
    if (type) bot.type = type;
    if (description !== undefined) bot.description = description;
    if (color) bot.color = color;
    if (status) bot.status = status;
    if (useGlobalGeminiKey !== undefined) bot.useGlobalGeminiKey = useGlobalGeminiKey;

    // Update Pinecone config if provided
    if (pineconeKey) {
      bot.pineconeKey = encrypt(pineconeKey);
      bot.pineconeVerified = false; // Reset verification
    }
    if (pineconeEnvironment) bot.pineconeEnvironment = pineconeEnvironment;
    if (pineconeIndexName) bot.pineconeIndexName = pineconeIndexName;
    
    // Update pineconeHost if environment or index changed
    if (pineconeEnvironment || pineconeIndexName) {
      const env = pineconeEnvironment || bot.pineconeEnvironment;
      const idx = pineconeIndexName || bot.pineconeIndexName;
      if (env.includes('-')) {
        bot.pineconeHost = `https://${idx}.svc.${env}.pinecone.io`;
      } else {
        bot.pineconeHost = `https://${idx}-${env}.svc.pinecone.io`;
      }
    }

    // Update Gemini key if provided
    if (geminiKey) {
      bot.geminiKey = encrypt(geminiKey);
      bot.geminiVerified = false; // Reset verification
    }

    await bot.save();

    const botResponse = {
      id: bot._id,
      name: bot.name,
      type: bot.type,
      description: bot.description,
      status: bot.status,
      color: bot.color,
      pineconeEnvironment: bot.pineconeEnvironment,
      pineconeIndexName: bot.pineconeIndexName,
      pineconeVerified: bot.pineconeVerified,
      geminiVerified: bot.geminiVerified,
      useGlobalGeminiKey: bot.useGlobalGeminiKey,
      totalQueries: bot.totalQueries,
      avgResponseTime: bot.avgResponseTime,
      accuracy: bot.accuracy,
      updatedAt: bot.updatedAt,
    };

    res.json({
      message: 'Bot updated successfully',
      bot: botResponse,
    });
  } catch (error) {
    console.error('Error updating bot:', error);
    res.status(500).json({ error: 'Failed to update bot' });
  }
};

// Delete bot
export const deleteBot = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;

    const bot = await Bot.findOneAndDelete({ _id: id, userId });

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    res.json({ message: 'Bot deleted successfully' });
  } catch (error) {
    console.error('Error deleting bot:', error);
    res.status(500).json({ error: 'Failed to delete bot' });
  }
};

// Test bot API connections
export const testBotConnection = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;

    const bot = await Bot.findOne({ _id: id, userId });

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    // Decrypt keys for testing
    const pineconeKey = bot.pineconeKey ? decrypt(bot.pineconeKey) : null;
    const geminiKey = bot.geminiKey ? decrypt(bot.geminiKey) : null;

    let pineconeVerified = false;
    let geminiVerified = false;
    const testResults = {
      pinecone: { verified: false, message: '' },
      gemini: { verified: false, message: '' },
    };

    // Test Pinecone connection
    if (pineconeKey) {
      try {
        console.log('🔍 Testing Pinecone connection...');
        console.log(`   Index: ${bot.pineconeIndexName}, Environment: ${bot.pineconeEnvironment}`);
        
        // Use same smart URL detection as createBot
        let pineconeUrl = `https://${bot.pineconeIndexName}-${bot.pineconeEnvironment}.svc.pinecone.io/describe_index_stats`;
        
        // If environment looks like a region (e.g., us-east-1-aws), use legacy format
        if (bot.pineconeEnvironment.includes('-')) {
          // Legacy format: https://INDEX_NAME.svc.ENVIRONMENT.pinecone.io
          pineconeUrl = `https://${bot.pineconeIndexName}.svc.${bot.pineconeEnvironment}.pinecone.io/describe_index_stats`;
        }
        
        console.log(`   Testing URL: ${pineconeUrl}`);
        
        const pineconeResponse = await fetch(pineconeUrl, {
          method: 'GET',
          headers: {
            'Api-Key': pineconeKey,
            'Content-Type': 'application/json',
          },
        });
        
        console.log(`   Response status: ${pineconeResponse.status}`);
        
        if (pineconeResponse.ok) {
          const data = await pineconeResponse.json();
          pineconeVerified = true;
          testResults.pinecone = {
            verified: true,
            message: 'Pinecone connection successful',
            dimension: data.dimension,
            totalVectorCount: data.totalVectorCount,
          };
          console.log('✅ Pinecone connection successful - Dimension:', data.dimension, 'Vectors:', data.totalVectorCount);
        } else {
          const errorText = await pineconeResponse.text();
          testResults.pinecone = {
            verified: false,
            message: `Pinecone connection failed: ${pineconeResponse.status} - ${errorText.substring(0, 100)}`,
          };
          console.log('❌ Pinecone connection failed:', pineconeResponse.status, errorText.substring(0, 200));
        }
      } catch (error) {
        testResults.pinecone = {
          verified: false,
          message: `Pinecone error: ${error.message}`,
        };
        console.log('❌ Pinecone error:', error.message);
      }
    } else {
      testResults.pinecone = {
        verified: false,
        message: 'No Pinecone API key configured',
      };
    }

    // Test Gemini connection
    if (geminiKey) {
      try {
        console.log('🔍 Testing Gemini connection...');
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`;
        console.log(`   Testing URL: ${geminiUrl.replace(geminiKey, 'API_KEY_HIDDEN')}`);
        
        const geminiResponse = await fetch(geminiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: 'Test connection' }]
            }]
          }),
        });
        
        console.log(`   Response status: ${geminiResponse.status}`);
        
        if (geminiResponse.ok) {
          geminiVerified = true;
          testResults.gemini = {
            verified: true,
            message: 'Gemini connection successful',
          };
          console.log('✅ Gemini connection successful');
        } else {
          const errorData = await geminiResponse.json().catch(() => ({}));
          const errorMsg = errorData.error?.message || geminiResponse.statusText;
          testResults.gemini = {
            verified: false,
            message: `Gemini connection failed: ${geminiResponse.status} - ${errorMsg}`,
          };
          console.log('❌ Gemini connection failed:', geminiResponse.status, errorMsg);
        }
      } catch (error) {
        testResults.gemini = {
          verified: false,
          message: `Gemini error: ${error.message}`,
        };
        console.log('❌ Gemini error:', error.message);
      }
    } else {
      testResults.gemini = {
        verified: false,
        message: 'No Gemini API key configured',
      };
    }

    // Update bot verification status
    bot.pineconeVerified = pineconeVerified;
    bot.geminiVerified = geminiVerified;
    bot.lastVerified = new Date();
    
    // Update status based on verification
    if (pineconeVerified && geminiVerified) {
      bot.status = 'active';
    } else {
      bot.status = 'inactive';
    }

    await bot.save();

    res.json({
      message: 'Bot connections tested',
      pineconeVerified: bot.pineconeVerified,
      geminiVerified: bot.geminiVerified,
      status: bot.status,
      testResults,
    });
  } catch (error) {
    console.error('Error testing bot connection:', error);
    res.status(500).json({ error: 'Failed to test connections' });
  }
};

// Get embed code for bot
export const getEmbedCode = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;

    const bot = await Bot.findOne({ _id: id, userId });

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    // Generate embed code
    const apiUrl = process.env.API_URL || 'http://localhost:5001';
    const widgetUrl = process.env.WIDGET_URL || 'http://localhost:5174';
    
    const embedCode = `<!-- RAGhost Chat Widget -->
<script>
  (function() {
    window.raghostConfig = {
      botId: '${id}',
      apiUrl: '${apiUrl}',
      botName: '${bot.name}',
      botType: '${bot.type}',
      color: '${bot.color}',
    };
    var script = document.createElement('script');
    script.src = '${widgetUrl}/widget.js';
    script.async = true;
    document.body.appendChild(script);
  })();
</script>`;

    const iframeCode = `<!-- RAGhost Chat Widget (iframe) -->
<iframe 
  src="${widgetUrl}/chat/${id}" 
  width="400" 
  height="600" 
  frameborder="0"
  style="position: fixed; bottom: 20px; right: 20px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 9999;"
></iframe>`;

    res.json({
      success: true,
      embedCode,
      iframeCode,
      botId: id,
      botName: bot.name,
    });
  } catch (error) {
    console.error('Error generating embed code:', error);
    res.status(500).json({ error: 'Failed to generate embed code' });
  }
};
