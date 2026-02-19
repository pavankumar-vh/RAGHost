import Bot from '../models/Bot.js';
import { encrypt, decrypt } from '../utils/encryption.js';

/* ─────────────── EMBED HISTORY ─────────────── */

export const getEmbedHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    const bot = await Bot.findOne({ _id: id, userId }, 'embedHistory name');
    if (!bot) return res.status(404).json({ success: false, error: 'Bot not found' });
    const history = [...(bot.embedHistory || [])].reverse(); // newest first
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch embed history' });
  }
};

export const addEmbedSnapshot = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    const { color, name, type, note } = req.body;
    const bot = await Bot.findOne({ _id: id, userId });
    if (!bot) return res.status(404).json({ success: false, error: 'Bot not found' });
    bot.embedHistory = bot.embedHistory || [];
    // Avoid duplicate consecutive snapshots
    const last = bot.embedHistory[bot.embedHistory.length - 1];
    if (last && last.color === color && last.name === name && last.type === type) {
      const history = [...bot.embedHistory].reverse();
      return res.json({ success: true, data: history, duplicate: true });
    }
    bot.embedHistory.push({ savedAt: new Date(), color, name, type, note: note || '' });
    if (bot.embedHistory.length > 10) bot.embedHistory = bot.embedHistory.slice(-10);
    await bot.save();
    const history = [...bot.embedHistory].reverse();
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to save embed snapshot' });
  }
};

export const deleteEmbedSnapshot = async (req, res) => {
  try {
    const { id, snapId } = req.params;
    const userId = req.user.uid;
    const bot = await Bot.findOne({ _id: id, userId });
    if (!bot) return res.status(404).json({ success: false, error: 'Bot not found' });
    bot.embedHistory = (bot.embedHistory || []).filter(s => s._id.toString() !== snapId);
    await bot.save();
    res.json({ success: true, data: [...bot.embedHistory].reverse() });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete snapshot' });
  }
};

// Create a new bot
export const createBot = async (req, res) => {
  try {
    const { name, type, description, color, pineconeKey, pineconeEnvironment, pineconeIndexName, geminiKey, systemPrompt } = req.body;
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
      console.log(`   Host URL: ${pineconeEnvironment}`);
      console.log(`   Index: ${pineconeIndexName}`);
      
      // Use pineconeEnvironment directly as the host URL
      const pineconeUrl = `${pineconeEnvironment}/describe_index_stats`;
      
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

    // Test Gemini connection (test embedding model since that's what we use)
    try {
      console.log('🔍 Verifying Gemini Embedding API...');
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${geminiKey}`;
      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'models/gemini-embedding-001',
          content: {
            parts: [{ text: 'test' }]
          }
        }),
      });
      
      console.log(`   Response status: ${geminiResponse.status}`);
      
      if (geminiResponse.ok) {
        geminiVerified = true;
        console.log('✅ Gemini Embedding API verified');
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

    // Store pineconeEnvironment as the host URL (users now provide full URL)
    const pineconeHost = pineconeEnvironment;

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
      systemPrompt: systemPrompt || '',
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
      systemPrompt: bot.systemPrompt,
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
      systemPrompt: bot.systemPrompt,
      pineconeEnvironment: bot.pineconeEnvironment,
      pineconeIndexName: bot.pineconeIndexName,
      pineconeVerified: bot.pineconeVerified,
      geminiVerified: bot.geminiVerified,
      totalQueries: bot.totalQueries,
      avgResponseTime: bot.avgResponseTime,
      accuracy: bot.accuracy,
      temperature: bot.temperature,
      maxTokens: bot.maxTokens,
      welcomeMessage: bot.welcomeMessage,
      widgetConfig: bot.widgetConfig,
      teamMembers: bot.teamMembers || [],
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
      systemPrompt: bot.systemPrompt,
      pineconeEnvironment: bot.pineconeEnvironment,
      pineconeIndexName: bot.pineconeIndexName,
      pineconeVerified: bot.pineconeVerified,
      geminiVerified: bot.geminiVerified,
      totalQueries: bot.totalQueries,
      avgResponseTime: bot.avgResponseTime,
      accuracy: bot.accuracy,
      temperature: bot.temperature,
      maxTokens: bot.maxTokens,
      welcomeMessage: bot.welcomeMessage,
      widgetConfig: bot.widgetConfig,
      teamMembers: bot.teamMembers || [],
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
    const { name, type, description, color, pineconeKey, pineconeEnvironment, pineconeIndexName, geminiKey, useGlobalGeminiKey, status, systemPrompt } = req.body;

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
    if (systemPrompt !== undefined) bot.systemPrompt = systemPrompt;

    // Update Pinecone config if provided
    if (pineconeKey) {
      bot.pineconeKey = encrypt(pineconeKey);
      bot.pineconeVerified = false; // Reset verification
    }
    if (pineconeEnvironment) {
      bot.pineconeEnvironment = pineconeEnvironment;
      bot.pineconeHost = pineconeEnvironment; // Store as host URL
    }
    if (pineconeIndexName) bot.pineconeIndexName = pineconeIndexName;

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
      systemPrompt: bot.systemPrompt,
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

// Update bot AI settings (temperature, maxTokens, systemPrompt, welcomeMessage)
export const updateSettings = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    const { temperature, maxTokens, systemPrompt, welcomeMessage } = req.body;

    const bot = await Bot.findOne({ _id: id, userId });
    if (!bot) return res.status(404).json({ error: 'Bot not found' });

    if (temperature   !== undefined) bot.temperature   = Math.min(2, Math.max(0, Number(temperature)));
    if (maxTokens     !== undefined) bot.maxTokens     = Math.max(1, Number(maxTokens));
    if (systemPrompt  !== undefined) bot.systemPrompt  = systemPrompt;
    if (welcomeMessage !== undefined) bot.welcomeMessage = welcomeMessage;

    await bot.save();
    res.json({
      success: true,
      data: { temperature: bot.temperature, maxTokens: bot.maxTokens, systemPrompt: bot.systemPrompt, welcomeMessage: bot.welcomeMessage },
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

// Save widget customizer config
export const saveWidgetConfig = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    const allowed = [
      'primaryColor','secondaryColor','gradientAngle','backgroundColor','textColor',
      'userBubbleColor','botBubbleColor','botBubbleTextColor',
      'width','height','position','borderRadius','shadowIntensity','edgePadding',
      'buttonSize','buttonStyle','buttonIcon','buttonPulse','buttonLabel',
      'avatarEmoji','headerBotName','headerStatus','showAvatar','showStatusDot',
      'bubbleRadius','showTimestamps','showUserAvatar','showBotAvatar','messageSpacing',
      'fontFamily','fontSize','lineHeight','animationSpeed',
      'autoOpen','autoOpenDelay','notificationBadge','notificationCount',
      'welcomeMessage','inputPlaceholder','offlineMessage',
    ];

    const bot = await Bot.findOne({ _id: id, userId });
    if (!bot) return res.status(404).json({ error: 'Bot not found' });

    bot.widgetConfig = bot.widgetConfig || {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) bot.widgetConfig[key] = req.body[key];
    }
    bot.markModified('widgetConfig');
    await bot.save();
    res.json({ success: true, data: bot.widgetConfig });
  } catch (error) {
    console.error('Error saving widget config:', error);
    res.status(500).json({ error: 'Failed to save widget config' });
  }
};

// Get widget customizer config
export const getWidgetConfig = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    const bot = await Bot.findOne({ _id: id, userId }, 'widgetConfig welcomeMessage');
    if (!bot) return res.status(404).json({ error: 'Bot not found' });
    res.json({ success: true, data: { ...bot.widgetConfig?.toObject?.() || bot.widgetConfig, welcomeMessage: bot.welcomeMessage } });
  } catch (error) {
    console.error('Error fetching widget config:', error);
    res.status(500).json({ error: 'Failed to fetch widget config' });
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
        console.log(`   Host URL: ${bot.pineconeEnvironment}`);
        console.log(`   Index: ${bot.pineconeIndexName}`);
        
        // Use pineconeEnvironment directly as the host URL
        const pineconeUrl = `${bot.pineconeEnvironment}/describe_index_stats`;
        
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

    // Test Gemini connection (test embedding model since that's what we use)
    if (geminiKey) {
      try {
        console.log('🔍 Testing Gemini Embedding API...');
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${geminiKey}`;
        console.log(`   Testing URL: ${geminiUrl.replace(geminiKey, 'API_KEY_HIDDEN')}`);
        
        const geminiResponse = await fetch(geminiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'models/gemini-embedding-001',
            content: {
              parts: [{ text: 'test' }]
            }
          }),
        });
        
        console.log(`   Response status: ${geminiResponse.status}`);
        
        if (geminiResponse.ok) {
          geminiVerified = true;
          testResults.gemini = {
            verified: true,
            message: 'Gemini Embedding API connection successful',
          };
          console.log('✅ Gemini Embedding API connection successful');
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

// Get bot by ID (public - no auth required for embedded widgets)
export const getBotByIdPublic = async (req, res) => {
  try {
    const { id } = req.params;

    const bot = await Bot.findOne({ _id: id });

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    // Return only public information (no API keys)
    const botResponse = {
      id: bot._id,
      name: bot.name,
      type: bot.type,
      description: bot.description,
      color: bot.color,
      status: bot.status,
      createdAt: bot.createdAt,
    };

    res.json(botResponse);
  } catch (error) {
    console.error('Error fetching bot:', error);
    res.status(500).json({ error: 'Failed to fetch bot' });
  }
};
