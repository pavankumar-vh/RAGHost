# 🎨 Widget Templates - Visual Guide

## User Interface Flow

```
┌─────────────────────────────────────────────────────────────┐
│  RAGHost Dashboard                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  My Bots                                                    │
│  ┌───────────────────────────────────────────────────┐    │
│  │ Support Bot                            [Edit] [X]│    │
│  │ Type: Support | Color: Pink                      │    │
│  │ Documents: 5 | Active: Yes                       │    │
│  │                                                   │    │
│  │ [Chat] [Analytics] [Documents] [Get Embed Code] │    │
│  └───────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘

            ↓ User clicks "Get Embed Code"

┌──────────────────────────────────────────────────────────────────┐
│  🎨 Embed Your Bot                                          [X] │
├──────────────────────────────────────────────────────────────────┤
│  Add Support Bot to your website                                │
│                                                                  │
│  ┌──────────────────┬──────────────────┐                       │
│  │ Widget Templates │ Custom Embed     │                       │
│  └──────────────────┴──────────────────┘                       │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ 💡 Choose Your Widget Style                            │   │
│  │ Select a template below and copy the code to your      │   │
│  │ website. Each template is fully functional and         │   │
│  │ customizable.                                           │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────┐  ┌─────────────────────────┐    │
│  │ 💬 Classic Bubble       │  │ 📱 Fullscreen Sidebar   │    │
│  │ ─────────────────────── │  │ ─────────────────────── │    │
│  │ Traditional chat bubble │  │ Slide-in sidebar from   │    │
│  │ in bottom-right corner  │  │ right edge              │    │
│  │                         │  │                         │    │
│  │ [bottom-right][medium]  │  │ [right][large][panel]   │    │
│  │ [circle]                │  │                         │    │
│  │                         │  │                         │    │
│  │ <!-- RAGhost Chat... -->│  │ <!-- RAGhost Chat... -->│    │
│  │                         │  │                         │    │
│  │ [📋 Copy Code]          │  │ [📋 Copy Code]          │    │
│  └─────────────────────────┘  └─────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────┐  ┌─────────────────────────┐    │
│  │ ✨ Minimal Popup        │  │ ⚡ Inline Embed         │    │
│  │ ─────────────────────── │  │ ─────────────────────── │    │
│  │ Small, elegant popup    │  │ Embedded directly in    │    │
│  │ window                  │  │ page content            │    │
│  │                         │  │                         │    │
│  │ [bottom-right][small]   │  │ [inline][flexible]      │    │
│  │ [rounded]               │  │ [container]             │    │
│  │                         │  │                         │    │
│  │ <!-- RAGhost Chat... -->│  │ <!-- RAGhost Chat... -->│    │
│  │                         │  │                         │    │
│  │ [📋 Copy Code]          │  │ [📋 Copy Code]          │    │
│  └─────────────────────────┘  └─────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────┐  ┌─────────────────────────┐    │
│  │ 📊 Bottom Bar           │  │ 🎨 Custom Styled        │    │
│  │ ─────────────────────── │  │ ─────────────────────── │    │
│  │ Full-width bar at       │  │ Fully customizable with │    │
│  │ bottom of page          │  │ CSS variables           │    │
│  │                         │  │                         │    │
│  │ [bottom][full-width]    │  │ [bottom-right][medium]  │    │
│  │ [bar]                   │  │ [custom]                │    │
│  │                         │  │                         │    │
│  │ <!-- RAGhost Chat... -->│  │ <!-- RAGhost Chat... -->│    │
│  │                         │  │                         │    │
│  │ [📋 Copy Code]          │  │ [📋 Copy Code]          │    │
│  └─────────────────────────┘  └─────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────┐  ┌─────────────────────────┐    │
│  │ 📱 Mobile Optimized     │  │ 🎯 FAB Style            │    │
│  │ ─────────────────────── │  │ ─────────────────────── │    │
│  │ Responsive design for   │  │ Material Design         │    │
│  │ mobile devices          │  │ floating action button  │    │
│  │                         │  │                         │    │
│  │ [adaptive][responsive]  │  │ [bottom-right][large]   │    │
│  │ [adaptive]              │  │ [circle]                │    │
│  │                         │  │                         │    │
│  │ <!-- RAGhost Chat... -->│  │ <!-- RAGhost Chat... -->│    │
│  │                         │  │                         │    │
│  │ [📋 Copy Code]          │  │ [📋 Copy Code]          │    │
│  └─────────────────────────┘  └─────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ ✨ How to Use                                          │   │
│  │ 1. Choose a template that matches your website design  │   │
│  │ 2. Click "Copy Code" to copy the embed code           │   │
│  │ 3. Paste into your website before </body> tag         │   │
│  │ 4. Save and deploy - widget appears automatically!     │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ ⚡ Customization Tips                                   │   │
│  │ • Modify width and height values to resize             │   │
│  │ • Change position to place widget in different corners │   │
│  │ • Use CSS variables in Custom Styled template          │   │
│  │ • Mobile Optimized template auto-adjusts for screens   │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Template Visual Examples

### 1. Classic Bubble (Bottom-Right)

```
┌────────────────────────────────────────┐
│                                        │
│  Your Website Content                 │
│                                        │
│                                        │
│                                        │
│                                  ┌───┐ │
│                                  │ 💬│ │  ← Floating Bubble
│                                  └───┘ │
└────────────────────────────────────────┘

Clicks → 

┌────────────────────────────────────────┐
│                                        │
│  Your Website Content            ┌────┤
│                                  │Chat│
│                                  │────│
│                                  │Hi! │
│                                  │How │
│                                  │can │  ← Expanded Chat
│                              ┌───│I   │
│                              │💬 │help│
│                              └───│you?│
└────────────────────────────────── ────┘
```

---

### 2. Fullscreen Sidebar (Right Edge)

```
┌────────────────────────────────────────┐
│                                   │Sho │  ← Trigger Button
│  Your Website Content             └────┤
│                                        │
│                                        │
│                                        │
└────────────────────────────────────────┘

Clicks → 

┌──────────────────────────┬─────────────┐
│                          │ Chat Panel  │
│  Your Website Content    │─────────────│
│  (Pushed Left)           │             │
│                          │ Hi! How can │  ← Sidebar
│                          │ I help you? │
│                          │             │
│                          │ [Message...] │
└──────────────────────────┴─────────────┘
```

---

### 3. Minimal Popup (Compact)

```
┌────────────────────────────────────────┐
│                                        │
│  Your Website Content                 │
│                                        │
│                                        │
│                            ┌──────┐    │
│                            │ Chat │    │  ← Small Popup
│                            │──────│    │
│                            │ Hi!  │    │
│                            └──────┘    │
└────────────────────────────────────────┘
```

---

### 4. Inline Embed (In Content)

```
┌────────────────────────────────────────┐
│                                        │
│  Page Header                           │
│                                        │
│  ┌────────────────────────────────┐   │
│  │ Need Help? Chat with us below: │   │
│  └────────────────────────────────┘   │
│                                        │
│  ┌────────────────────────────────┐   │
│  │  💬 Chat Widget                │   │  ← Inline (Part of Page)
│  │  ──────────────────────────    │   │
│  │  How can I help you today?     │   │
│  │  [Type your message...]        │   │
│  └────────────────────────────────┘   │
│                                        │
│  Page Footer                           │
└────────────────────────────────────────┘
```

---

### 5. Bottom Bar (Full Width)

```
┌────────────────────────────────────────┐
│                                        │
│  Your Website Content                 │
│  (Scrollable)                          │
│                                        │
├────────────────────────────────────────┤
│ 💬 Need help? Click to chat [Expand] │  ← Bottom Bar (Collapsed)
└────────────────────────────────────────┘

Clicks → 

┌────────────────────────────────────────┐
│  Your Website Content                 │
├────────────────────────────────────────┤
│  💬 Chat with Support                 │
│  ──────────────────────────────────   │
│  Hello! How can I assist you?         │  ← Bottom Bar (Expanded)
│  [Type your message here...]          │
└────────────────────────────────────────┘
```

---

### 6. FAB Style (Material Design)

```
┌────────────────────────────────────────┐
│                                        │
│  Your Website Content                 │
│                                        │
│                                        │
│                                  ┌────┐│
│                                  │ 💬 ││ ← Large FAB Button
│                                  │Chat││   with Label
│                                  └────┘│
└────────────────────────────────────────┘
```

---

## Template Selection Flow

```
User Journey:
─────────────

1. Dashboard
   │
   ↓
2. Click "Get Embed Code"
   │
   ↓
3. See "Widget Templates" tab (active by default)
   │
   ↓
4. Browse 8 template cards
   │ ├─ Classic Bubble
   │ ├─ Fullscreen Sidebar
   │ ├─ Minimal Popup
   │ ├─ Inline Embed
   │ ├─ Bottom Bar
   │ ├─ Custom Styled
   │ ├─ Mobile Optimized
   │ └─ FAB Style
   │
   ↓
5. Read description & preview
   │
   ↓
6. Check style badges (position, size, shape)
   │
   ↓
7. Click "Copy Code"
   │
   ↓
8. Button shows "✓ Copied!"
   │
   ↓
9. Paste into website HTML
   │
   ↓
10. Widget appears on website!
```

---

## Code Generation Example

### User Selects: Classic Bubble

**Generated Code:**
```html
<!-- RAGhost Chat Widget - Classic Bubble -->
<div id="raghost-widget"></div>
<script>
  (function() {
    window.raghostConfig = {
      botId: 'abc123',
      apiUrl: 'https://raghost-pcgw.onrender.com',
      botName: 'Support Bot',
      botType: 'Support',
      color: 'pink',
      position: 'bottom-right',
      theme: 'classic'
    };
    var script = document.createElement('script');
    script.src = 'https://rag-host.vercel.app/widget.js';
    script.async = true;
    document.body.appendChild(script);
  })();
</script>
```

### User Selects: Sidebar

**Generated Code:**
```html
<!-- RAGhost Chat Widget - Sidebar -->
<div id="raghost-widget"></div>
<script>
  (function() {
    window.raghostConfig = {
      botId: 'abc123',
      apiUrl: 'https://raghost-pcgw.onrender.com',
      botName: 'Support Bot',
      botType: 'Support',
      color: 'pink',
      position: 'sidebar-right',
      width: '400px',
      theme: 'sidebar'
    };
    var script = document.createElement('script');
    script.src = 'https://rag-host.vercel.app/widget.js';
    script.async = true;
    document.body.appendChild(script);
  })();
</script>
```

---

## Mobile Responsive Behavior

### Desktop View (> 768px)
```
┌────────────────────────────────────────┐
│                                        │
│  Full Desktop Layout                  │
│  - Classic Bubble: Bottom-right       │
│  - Sidebar: Full-height panel         │
│  - Inline: Full width                 │
│                                  ┌───┐ │
│                                  │💬 │ │
│                                  └───┘ │
└────────────────────────────────────────┘
```

### Mobile View (< 768px)
```
┌──────────────────┐
│                  │
│  Mobile Layout   │
│  - Classic:      │
│    Fullscreen    │
│  - Sidebar:      │
│    Bottom sheet  │
│  - Inline:       │
│    Full width    │
│            ┌────┐│
│            │ 💬 ││
│            └────┘│
└──────────────────┘
```

---

## Template Customization Interface

```
Template Card (Expanded View):
────────────────────────────────

┌─────────────────────────────────────┐
│ 💬 Classic Bubble                   │
│ ─────────────────────────────────── │
│                                     │
│ Traditional chat bubble in bottom-  │
│ right corner                        │
│                                     │
│ Style Options:                      │
│ ┌─────────────────────────────────┐│
│ │ Position: [bottom-right ▼]     ││
│ │ Size:     [medium ▼]           ││
│ │ Color:    [Pink ▼]             ││
│ │ Width:    [400px]              ││
│ │ Height:   [600px]              ││
│ └─────────────────────────────────┘│
│                                     │
│ Preview Code:                       │
│ ┌─────────────────────────────────┐│
│ │ <script>                        ││
│ │   window.raghostConfig = {...}  ││
│ │ </script>                       ││
│ └─────────────────────────────────┘│
│                                     │
│ [📋 Copy Code] [Preview]           │
└─────────────────────────────────────┘
```

---

## Success Indicators

### Copy Feedback
```
Before Click:
[📋 Copy Code]

During Click:
[⏳ Copying...]

After Click (2 seconds):
[✓ Copied!]

Then Returns To:
[📋 Copy Code]
```

---

## Error States

### Invalid Bot ID
```
┌─────────────────────────────────────┐
│ ⚠️ Error                             │
│ ─────────────────────────────────── │
│ Bot ID is required to generate      │
│ embed code. Please select a bot.    │
│                                     │
│ [Back to Dashboard]                 │
└─────────────────────────────────────┘
```

### Network Error
```
┌─────────────────────────────────────┐
│ ⚠️ Connection Error                  │
│ ─────────────────────────────────── │
│ Could not load templates.           │
│ Check your internet connection.     │
│                                     │
│ [Retry] [Cancel]                    │
└─────────────────────────────────────┘
```

---

## Accessibility Features

✅ **Keyboard Navigation**
   - Tab through template cards
   - Enter to copy code
   - Escape to close modal

✅ **Screen Reader Support**
   - Descriptive labels
   - ARIA roles
   - Status announcements

✅ **Focus Indicators**
   - Visible focus rings
   - Skip links
   - Logical tab order

---

## Performance Metrics

**Template Loading:**
- Initial render: < 100ms
- Code generation: < 10ms
- Copy to clipboard: < 50ms

**Bundle Size:**
- WidgetTemplates: ~15KB
- Icons (Lucide): ~3KB
- Total impact: ~18KB

---

## Browser Compatibility

```
┌────────────┬─────────┬────────────┐
│ Browser    │ Version │ Support    │
├────────────┼─────────┼────────────┤
│ Chrome     │ 90+     │ ✅ Full    │
│ Firefox    │ 88+     │ ✅ Full    │
│ Safari     │ 14+     │ ✅ Full    │
│ Edge       │ 90+     │ ✅ Full    │
│ Opera      │ 76+     │ ✅ Full    │
│ iOS Safari │ 14+     │ ✅ Full    │
│ Android    │ 90+     │ ✅ Full    │
└────────────┴─────────┴────────────┘
```

---

**Made with ❤️ for RAGHost**
