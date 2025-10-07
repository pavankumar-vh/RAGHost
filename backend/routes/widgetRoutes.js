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

  const templateUrls = {
    'default': `${baseUrl}/widget/templates/default.html`,
    'minimal': `${baseUrl}/widget/templates/minimal.html`,
    'modern-dark': `${baseUrl}/widget/templates/modern-dark.html`,
    'glass': `${baseUrl}/widget/templates/glass.html`
  };

  const templateUrl = templateUrls[template] || templateUrls['default'];

  return `<!-- RAGhost Chat Widget -->
<script>
  window.RAGhostConfig = {
    botId: '${botId}',
    botName: '${botName}',
    apiUrl: '${baseUrl}/api',
    avatar: '${avatar}',
    theme: {
      primaryColor: '${primaryColor}',
      position: '${position}'
    }
  };
</script>
<iframe 
  src="${templateUrl}" 
  style="position: fixed; ${position.includes('right') ? 'right: 24px;' : 'left: 24px;'} ${position.includes('bottom') ? 'bottom: 24px;' : 'top: 24px;'} border: none; z-index: 9999; width: 400px; height: 650px; pointer-events: none;"
  id="raghost-widget-iframe"
  allow="clipboard-write"
></iframe>
<script>
  // Allow pointer events on widget
  const iframe = document.getElementById('raghost-widget-iframe');
  iframe.onload = function() {
    iframe.style.pointerEvents = 'all';
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
