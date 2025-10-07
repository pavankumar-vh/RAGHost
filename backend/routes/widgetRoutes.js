import express from 'express';
const router = express.Router();

// Generate widget embed code
router.post('/generate', async (req, res) => {
  try {
    const { botId, template = 'default', customization = {} } = req.body;

    if (!botId) {
      return res.status(400).json({ error: 'Bot ID is required' });
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // Generate embed code based on template
    const embedCode = generateEmbedCode(botId, template, baseUrl, customization);
    
    res.json({
      success: true,
      embedCode,
      instructions: getEmbedInstructions(template)
    });
  } catch (error) {
    console.error('Error generating embed code:', error);
    res.status(500).json({ error: 'Failed to generate embed code' });
  }
});

// Helper function to generate embed code
function generateEmbedCode(botId, template, baseUrl, customization) {
  const {
    botName = 'AI Assistant',
    primaryColor = '#3b82f6',
    position = 'bottom-right',
    avatar = '🤖'
  } = customization;

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
  
  const templateUrls = {
    'default': `${backendUrl}/widget/templates/default.html`,
    'minimal': `${backendUrl}/widget/templates/minimal.html`,
    'modern-dark': `${backendUrl}/widget/templates/modern-dark.html`,
    'glass': `${backendUrl}/widget/templates/glass.html`
  };

  const templateUrl = templateUrls[template] || templateUrls['default'];

  return `<!-- RAGhost Chat Widget -->
<script>
  window.RAGhostConfig = {
    botId: '${botId}',
    botName: '${botName}',
    apiUrl: '${backendUrl}',
    avatar: '${avatar}',
    theme: {
      primaryColor: '${primaryColor}',
      position: '${position}'
    }
  };
</script>
<iframe 
  src="${templateUrl}?botId=${botId}&apiUrl=${encodeURIComponent(backendUrl)}" 
  style="position: fixed; ${position.includes('right') ? 'right: 0;' : 'left: 0;'} ${position.includes('bottom') ? 'bottom: 0;' : 'top: 0;'} border: none; z-index: 999999; width: 100%; height: 100%; pointer-events: none; background: transparent;"
  id="raghost-widget-iframe"
  allow="clipboard-write"
  frameborder="0"
  scrolling="no"
  allowtransparency="true"
></iframe>
<script>
  // Initialize widget in iframe
  const iframe = document.getElementById('raghost-widget-iframe');
  iframe.onload = function() {
    iframe.style.pointerEvents = 'auto';
    try {
      iframe.contentWindow.postMessage({
        type: 'init',
        config: window.RAGhostConfig
      }, '*');
    } catch (e) {
      console.log('Widget initialized');
    }
  };
</script>
<!-- End RAGhost Chat Widget -->`;
}

// Helper function to get embed instructions
function getEmbedInstructions(template) {
  return {
    step1: 'Copy the embed code above',
    step2: 'Paste it before the closing </body> tag of your website',
    step3: 'The chat widget will appear on your website',
    templates: {
      'default': 'Full-featured widget with gradient theme, avatars, and timestamps',
      'minimal': 'Clean and simple widget with minimal design',
      'modern-dark': 'Modern dark theme with blue gradient accents',
      'glass': 'Glass morphism effect with frosted blur background'
    }
  };
}

export default router;
