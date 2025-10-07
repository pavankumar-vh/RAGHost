# RAGhost Chat Widget - Usage Guide

## 🎨 Available Templates

Choose from 4 beautiful, production-ready widget templates:

1. **Default** - Full-featured gradient theme (purple gradient)
   - Avatars with emojis
   - Typing indicators
   - Timestamps
   - Smooth animations

2. **Minimal** - Clean black & white theme
   - Minimalist design
   - Smaller footprint
   - Fast loading

3. **Modern Dark** - Dark theme with blue accents
   - Blue gradient highlights
   - Dark mode friendly
   - Modern aesthetics

4. **Glass** - Frosted glass morphism
   - Beautiful blur effects
   - Light, airy design
   - Premium look

## 📦 How to Embed on Your Website

### Step 1: Go to Dashboard
1. Login to your RAGhost dashboard
2. Navigate to "My Bots"
3. Click the `</>` (Code) button on your bot

### Step 2: Choose Template
1. Click the "Widget Templates" tab
2. Select your preferred template design
3. Click "Generate Embed Code"

### Step 3: Copy & Paste
1. Copy the generated embed code
2. Paste it into your website's HTML
3. Place it **before the closing `</body>` tag**

### Example Embed Code:
```html
<!-- RAGhost Chat Widget -->
<script>
  window.RAGhostConfig = {
    botId: 'YOUR_BOT_ID',
    botName: 'AI Assistant',
    apiUrl: 'http://localhost:5001/api',
    avatar: '🤖',
    theme: {
      primaryColor: '#3b82f6',
      position: 'bottom-right'
    }
  };
</script>
<iframe 
  src="http://localhost:5001/widget/templates/default.html?botId=YOUR_BOT_ID" 
  style="position: fixed; right: 24px; bottom: 24px; border: none; z-index: 9999; width: 80px; height: 80px; border-radius: 50%;"
  id="raghost-widget-iframe"
  allow="clipboard-write"
  frameborder="0"
></iframe>
<script>
  const iframe = document.getElementById('raghost-widget-iframe');
  iframe.onload = function() {
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
<!-- End RAGhost Chat Widget -->
```

## 🎯 Testing Locally

Use the included `test-widget.html` file:

1. Open `test-widget.html` in your editor
2. Replace `YOUR_BOT_ID_HERE` with your actual bot ID
3. Open the file in a web browser
4. The widget should appear in the bottom-right corner

## 🌐 Widget URLs

All templates are served from your backend:

- Default: `http://localhost:5001/widget/templates/default.html`
- Minimal: `http://localhost:5001/widget/templates/minimal.html`
- Modern Dark: `http://localhost:5001/widget/templates/modern-dark.html`
- Glass: `http://localhost:5001/widget/templates/glass.html`

## 🔧 Customization Options

You can customize the widget through the `RAGhostConfig` object:

```javascript
window.RAGhostConfig = {
  botId: 'your-bot-id',           // Required: Your bot's unique ID
  botName: 'AI Assistant',         // Bot display name
  apiUrl: 'http://localhost:5001/api', // API endpoint
  avatar: '🤖',                    // Bot avatar emoji
  theme: {
    primaryColor: '#3b82f6',      // Primary color
    position: 'bottom-right'      // Position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  }
};
```

## 📱 Mobile Responsive

All templates are fully responsive and work seamlessly on:
- Desktop computers
- Tablets
- Mobile phones

## 🚀 Production Deployment

When deploying to production:

1. Update the `apiUrl` in your embed code to your production backend URL
2. Update the iframe `src` to your production backend URL
3. Ensure CORS is properly configured in your backend
4. Test on multiple devices and browsers

## 🛠️ Troubleshooting

**Widget not appearing:**
- Check that the backend server is running
- Verify the bot ID is correct
- Check browser console for errors
- Ensure the iframe URL is accessible

**Chat not responding:**
- Verify API keys are correctly configured
- Check that knowledge base documents are uploaded
- Ensure the bot status is "Active"

**CORS errors:**
- Make sure your website domain is allowed in backend CORS settings
- Update `backend/server.js` CORS configuration

## 📝 Notes

- Widget templates are standalone HTML files
- No external dependencies required
- Uses vanilla JavaScript for maximum compatibility
- Lightweight and fast loading
- Works with all modern browsers

## 🔒 Security

- All API calls use HTTPS in production
- Bot IDs are public identifiers (not sensitive)
- API keys are stored securely on the backend
- Rate limiting is enabled to prevent abuse

## 💡 Tips

- Test locally before deploying to production
- Use the "Widget Templates" tab for easiest setup
- Choose a template that matches your website design
- The widget position can be customized via CSS

---

For more help, visit: [RAGhost Documentation](https://github.com/pavankumar-vh/RAGHost)
