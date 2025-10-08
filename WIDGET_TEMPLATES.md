# 🎨 RAGHost Widget Templates Guide

Complete guide for embedding RAGHost chatbots on your website with 8 professional templates.

---

## 📚 Table of Contents

- [Quick Start](#quick-start)
- [Template Overview](#template-overview)
- [Installation Methods](#installation-methods)
- [Template Comparison](#template-comparison)
- [Configuration Options](#configuration-options)
- [Examples](#examples)
- [Advanced Customization](#advanced-customization)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### 3 Steps to Add Chat to Your Website

1. **Get Your Bot ID**
   - Login to [RAGHost](https://rag-host.vercel.app)
   - Create or select your bot
   - Copy the Bot ID from dashboard

2. **Choose a Template**
   - Click "Get Embed Code" button
   - Browse 8 widget templates
   - Select the one that matches your design

3. **Copy & Paste**
   - Copy the generated code
   - Paste before `</body>` tag
   - Save and deploy!

---

## 🎯 Template Overview

### 1. Classic Bubble 🔵

**Best for:** E-commerce, Blogs, General websites

Traditional floating chat button that expands into a chat window.

```javascript
window.raghostConfig = {
  botId: 'your-bot-id',
  position: 'bottom-right',
  theme: 'classic'
};
```

**Features:**
- ✅ Floating button in corner
- ✅ Smooth expand/collapse animation
- ✅ Minimize/maximize controls
- ✅ Unobtrusive design

**Use Cases:**
- Online stores
- Blog websites
- Portfolio sites
- Marketing pages

---

### 2. Fullscreen Sidebar 📱

**Best for:** Documentation, SaaS platforms, Admin panels

Full-height sidebar that slides in from the right edge.

```javascript
window.raghostConfig = {
  botId: 'your-bot-id',
  position: 'sidebar-right',
  width: '400px',
  theme: 'sidebar'
};
```

**Features:**
- ✅ Full-height panel
- ✅ Slide-in animation
- ✅ More screen space
- ✅ Better for long conversations

**Use Cases:**
- Documentation sites
- SaaS dashboards
- Admin interfaces
- Support portals

---

### 3. Minimal Popup ✨

**Best for:** Landing pages, Portfolios, Minimalist sites

Clean, compact chat window with subtle design.

```javascript
window.raghostConfig = {
  botId: 'your-bot-id',
  width: '350px',
  height: '500px',
  theme: 'minimal',
  showAvatar: false
};
```

**Features:**
- ✅ Small footprint
- ✅ Elegant design
- ✅ No clutter
- ✅ Customizable size

**Use Cases:**
- Landing pages
- Personal portfolios
- Minimalist designs
- Mobile-first sites

---

### 4. Inline Embed ⚡

**Best for:** Help centers, Support pages, Knowledge bases

Embedded directly into page content, not floating.

```javascript
window.raghostConfig = {
  botId: 'your-bot-id',
  position: 'inline',
  containerId: 'raghost-widget-inline',
  theme: 'inline',
  showCloseButton: false
};
```

**Features:**
- ✅ Part of page flow
- ✅ No overlay
- ✅ Container-based
- ✅ Flexible sizing

**Use Cases:**
- Help center pages
- FAQ sections
- Support articles
- Embedded assistants

---

### 5. Bottom Bar 📊

**Best for:** Marketing sites, News portals, Media sites

Full-width sticky bar at bottom that expands upward.

```javascript
window.raghostConfig = {
  botId: 'your-bot-id',
  position: 'bottom',
  theme: 'bar',
  height: '80px',
  expandable: true
};
```

**Features:**
- ✅ Full-width design
- ✅ Prominent placement
- ✅ Expands on click
- ✅ Mobile-friendly

**Use Cases:**
- Marketing websites
- News portals
- Media platforms
- High-traffic sites

---

### 6. Custom Styled 🎨

**Best for:** Enterprise sites, Brand-focused designs

Fully customizable with CSS variables for perfect brand matching.

```javascript
window.raghostConfig = {
  botId: 'your-bot-id',
  theme: 'custom',
  customStyles: true
};
```

**CSS Variables:**
```css
:root {
  --raghost-primary-color: #FF95DD;
  --raghost-bg-color: #1F1F1F;
  --raghost-text-color: #FFFFFF;
  --raghost-border-radius: 16px;
  --raghost-shadow: 0 10px 40px rgba(0,0,0,0.3);
  --raghost-font-family: 'Inter', sans-serif;
}
```

**Features:**
- ✅ CSS variable control
- ✅ Perfect brand alignment
- ✅ Typography customization
- ✅ Shadow and effects

**Use Cases:**
- Enterprise websites
- Strict brand guidelines
- Custom design systems
- Agency client sites

---

### 7. Mobile Optimized 📱

**Best for:** Mobile apps, PWAs, Mobile-first sites

Responsive design that automatically adjusts for mobile devices.

```javascript
window.raghostConfig = {
  botId: 'your-bot-id',
  position: 'fullscreen-mobile',
  theme: 'mobile',
  responsive: true,
  breakpoint: 768
};
```

**Features:**
- ✅ Touch-optimized
- ✅ Swipe gestures
- ✅ Auto-fullscreen on mobile
- ✅ Responsive breakpoints

**Use Cases:**
- Mobile-first websites
- Progressive Web Apps (PWA)
- React Native WebView
- Mobile shopping apps

---

### 8. FAB Style 🎯

**Best for:** Modern web apps, Material Design sites

Material Design floating action button with ripple effects.

```javascript
window.raghostConfig = {
  botId: 'your-bot-id',
  theme: 'fab',
  size: 'large',
  showLabel: true,
  rippleEffect: true
};
```

**Features:**
- ✅ Material Design style
- ✅ Ripple animations
- ✅ Optional label
- ✅ Large button size

**Use Cases:**
- Material Design apps
- Google-style interfaces
- Modern web applications
- Android-style PWAs

---

## 📦 Installation Methods

### Method 1: Script Tag (Recommended)

```html
<script>
  (function() {
    window.raghostConfig = {
      botId: 'your-bot-id',
      apiUrl: 'https://raghost-pcgw.onrender.com',
      botName: 'Assistant',
      theme: 'classic'
    };
    var script = document.createElement('script');
    script.src = 'https://rag-host.vercel.app/widget.js';
    script.async = true;
    document.body.appendChild(script);
  })();
</script>
```

**Advantages:**
- ✅ Dynamic loading
- ✅ No CORS issues
- ✅ Easy to update
- ✅ Works everywhere

---

### Method 2: iFrame

```html
<iframe 
  src="https://rag-host.vercel.app/chat/your-bot-id" 
  width="400" 
  height="600" 
  frameborder="0"
  style="position: fixed; bottom: 20px; right: 20px; border-radius: 12px;"
></iframe>
```

**Advantages:**
- ✅ Simple implementation
- ✅ Sandbox isolation
- ✅ No JavaScript conflicts

**Disadvantages:**
- ❌ Less customizable
- ❌ Fixed positioning
- ❌ SEO limitations

---

## 📊 Template Comparison

| Template | Desktop | Mobile | Customization | Performance | Use Case |
|----------|---------|--------|---------------|-------------|----------|
| **Classic Bubble** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | General |
| **Fullscreen Sidebar** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Documentation |
| **Minimal Popup** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Landing Pages |
| **Inline Embed** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Help Centers |
| **Bottom Bar** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | Marketing |
| **Custom Styled** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Enterprise |
| **Mobile Optimized** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Mobile-First |
| **FAB Style** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Modern Apps |

---

## ⚙️ Configuration Options

### Core Options

```javascript
window.raghostConfig = {
  // Required
  botId: 'abc123',                    // Your bot ID
  apiUrl: 'https://api.example.com',  // API endpoint
  
  // Bot Information
  botName: 'Support Bot',             // Display name
  botType: 'Support',                 // Bot type
  
  // Appearance
  color: 'pink',                      // pink, yellow, blue
  theme: 'classic',                   // Template theme
  
  // Positioning
  position: 'bottom-right',           // Widget position
  width: '400px',                     // Custom width
  height: '600px',                    // Custom height
  
  // Features
  showAvatar: true,                   // Show bot avatar
  showCloseButton: true,              // Show close button
  rippleEffect: true,                 // Material ripple
  expandable: true,                   // Allow expand/collapse
  
  // Advanced
  responsive: true,                   // Auto-adjust sizing
  breakpoint: 768,                    // Mobile breakpoint
  customStyles: true,                 // Enable CSS variables
  containerId: 'widget-container',    // Container ID (inline)
};
```

### Position Options

- `bottom-right` - Bottom right corner (default)
- `bottom-left` - Bottom left corner
- `top-right` - Top right corner
- `top-left` - Top left corner
- `sidebar-right` - Right sidebar
- `sidebar-left` - Left sidebar
- `bottom` - Bottom bar (full width)
- `top` - Top bar (full width)
- `inline` - Inline in page content
- `fullscreen-mobile` - Fullscreen on mobile

### Color Themes

- `pink` - Pink accent (#FF95DD)
- `yellow` - Yellow accent (#F6FF7F)
- `blue` - Blue accent (#B7BEFE)

### Template Themes

- `classic` - Classic bubble design
- `sidebar` - Sidebar panel
- `minimal` - Minimal popup
- `inline` - Inline embed
- `bar` - Bottom/top bar
- `custom` - CSS customizable
- `mobile` - Mobile optimized
- `fab` - Floating action button

---

## 💡 Examples

### E-commerce Store

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Store</title>
</head>
<body>
  <header>Store Header</header>
  <main>Product Catalog</main>
  <footer>Store Footer</footer>
  
  <!-- RAGHost Widget -->
  <script>
    (function() {
      window.raghostConfig = {
        botId: 'store-bot-123',
        apiUrl: 'https://raghost-pcgw.onrender.com',
        botName: 'Store Assistant',
        botType: 'Sales',
        color: 'pink',
        theme: 'classic',
        position: 'bottom-right'
      };
      var script = document.createElement('script');
      script.src = 'https://rag-host.vercel.app/widget.js';
      script.async = true;
      document.body.appendChild(script);
    })();
  </script>
</body>
</html>
```

---

### Documentation Site

```html
<!DOCTYPE html>
<html>
<head>
  <title>API Docs</title>
</head>
<body>
  <nav>Documentation Nav</nav>
  <main>Documentation Content</main>
  
  <!-- RAGHost Sidebar Widget -->
  <script>
    (function() {
      window.raghostConfig = {
        botId: 'docs-bot-456',
        apiUrl: 'https://raghost-pcgw.onrender.com',
        botName: 'Docs Assistant',
        botType: 'Documentation',
        color: 'blue',
        theme: 'sidebar',
        position: 'sidebar-right',
        width: '400px'
      };
      var script = document.createElement('script');
      script.src = 'https://rag-host.vercel.app/widget.js';
      script.async = true;
      document.body.appendChild(script);
    })();
  </script>
</body>
</html>
```

---

### Help Center (Inline)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Help Center</title>
</head>
<body>
  <h1>How can we help?</h1>
  
  <!-- Inline Chat Widget -->
  <div id="raghost-widget-inline" style="width: 100%; max-width: 800px; height: 600px; margin: 40px auto;"></div>
  
  <script>
    (function() {
      window.raghostConfig = {
        botId: 'help-bot-789',
        apiUrl: 'https://raghost-pcgw.onrender.com',
        botName: 'Help Assistant',
        botType: 'Support',
        color: 'yellow',
        theme: 'inline',
        position: 'inline',
        containerId: 'raghost-widget-inline',
        showCloseButton: false
      };
      var script = document.createElement('script');
      script.src = 'https://rag-host.vercel.app/widget.js';
      script.async = true;
      document.body.appendChild(script);
    })();
  </script>
</body>
</html>
```

---

### React Application

```jsx
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Configure RAGHost
    window.raghostConfig = {
      botId: 'react-bot-123',
      apiUrl: 'https://raghost-pcgw.onrender.com',
      botName: 'App Assistant',
      color: 'blue',
      theme: 'fab'
    };
    
    // Load script
    const script = document.createElement('script');
    script.src = 'https://rag-host.vercel.app/widget.js';
    script.async = true;
    document.body.appendChild(script);
    
    // Cleanup
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  
  return (
    <div className="App">
      <h1>My React App</h1>
      {/* Widget loads automatically */}
    </div>
  );
}
```

---

### WordPress Site

Add to your theme's `footer.php` before `</body>`:

```php
<!-- RAGHost Chat Widget -->
<script>
  (function() {
    window.raghostConfig = {
      botId: 'wordpress-bot-456',
      apiUrl: 'https://raghost-pcgw.onrender.com',
      botName: 'Site Assistant',
      botType: 'Support',
      color: 'pink',
      theme: 'classic'
    };
    var script = document.createElement('script');
    script.src = 'https://rag-host.vercel.app/widget.js';
    script.async = true;
    document.body.appendChild(script);
  })();
</script>
```

---

## 🎨 Advanced Customization

### Custom Colors

```css
<style>
:root {
  --raghost-primary-color: #FF6B9D;
  --raghost-primary-hover: #FF8FB5;
  --raghost-bg-color: #1A1A1A;
  --raghost-surface-color: #2D2D2D;
  --raghost-text-color: #FFFFFF;
  --raghost-text-secondary: #A0A0A0;
  --raghost-border-color: #3D3D3D;
  --raghost-border-radius: 12px;
  --raghost-shadow: 0 10px 40px rgba(0,0,0,0.5);
  --raghost-font-family: 'Poppins', sans-serif;
  --raghost-font-size: 14px;
}
</style>
```

### Animation Control

```javascript
window.raghostConfig = {
  // ... other options
  animations: {
    enabled: true,
    duration: 300,        // ms
    easing: 'ease-out',
    slideIn: true,
    fadeIn: true
  }
};
```

### Event Callbacks

```javascript
window.raghostConfig = {
  // ... other options
  onLoad: function() {
    console.log('Widget loaded');
  },
  onOpen: function() {
    console.log('Widget opened');
  },
  onClose: function() {
    console.log('Widget closed');
  },
  onMessage: function(message) {
    console.log('Message sent:', message);
  }
};
```

---

## 🔧 Troubleshooting

### Widget Not Appearing

**Check:**
1. ✅ Bot ID is correct
2. ✅ Script is loaded (check Network tab)
3. ✅ No JavaScript errors in console
4. ✅ `window.raghostConfig` is defined before script loads

**Solution:**
```javascript
// Ensure config is set first
window.raghostConfig = { ... };

// Then load script
var script = document.createElement('script');
script.src = 'https://rag-host.vercel.app/widget.js';
document.body.appendChild(script);
```

---

### Widget Behind Other Elements

**Solution:**
Add higher z-index:

```css
#raghost-widget {
  z-index: 9999 !important;
}
```

---

### Widget Not Responsive on Mobile

**Solution:**
Enable mobile optimization:

```javascript
window.raghostConfig = {
  responsive: true,
  breakpoint: 768,
  theme: 'mobile'
};
```

---

### Colors Not Matching Brand

**Solution:**
Use custom styled template:

```javascript
window.raghostConfig = {
  theme: 'custom',
  customStyles: true
};
```

```css
:root {
  --raghost-primary-color: YOUR_BRAND_COLOR;
  --raghost-bg-color: YOUR_BG_COLOR;
}
```

---

### CORS Errors

**Solution:**
RAGHost API has CORS enabled. If you still see errors:

1. Make sure you're using correct API URL
2. Check if your domain is blocked
3. Contact support for whitelist

---

### Performance Issues

**Optimize:**
1. ✅ Use lazy loading: `script.async = true`
2. ✅ Load after page content
3. ✅ Use CDN version
4. ✅ Enable caching

---

## 📱 Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Opera | 76+ | ✅ Full |
| iOS Safari | 14+ | ✅ Full |
| Chrome Android | 90+ | ✅ Full |

---

## 📞 Support

Need help? We're here!

- 📧 **Email:** support@raghost.com
- 💬 **Discord:** [Join Community](https://discord.gg/raghost)
- 📚 **Docs:** [Full Documentation](https://rag-host.vercel.app/docs)
- 🐛 **Issues:** [GitHub Issues](https://github.com/pavankumar-vh/RAGHost/issues)

---

## 📄 License

Widget templates are part of RAGHost and licensed under MIT License.
Free for personal and commercial use.

---

**Made with ❤️ by RAGHost Team**

[Website](https://rag-host.vercel.app) • [GitHub](https://github.com/pavankumar-vh/RAGHost) • [Twitter](https://twitter.com/raghost)
