# Quick Test Script

## Test if new endpoints are deployed:

### PowerShell (Windows):
```powershell
# Test all three endpoints
$botId = "675479cc5dd23d3cf41b9d33"
$base = "https://raghost-pcgw.onrender.com"

Write-Host "`n🧪 Testing Widget Embed Endpoints..." -ForegroundColor Cyan

# Test 1: Widget endpoint
try {
    $result1 = Invoke-RestMethod -Uri "$base/api/widget/bot/$botId" -Method Get
    Write-Host "✅ Endpoint 1 (/api/widget/bot/:id): " -NoNewline -ForegroundColor Green
    Write-Host "SUCCESS - Bot: $($result1.name)" -ForegroundColor White
} catch {
    Write-Host "❌ Endpoint 1 (/api/widget/bot/:id): " -NoNewline -ForegroundColor Red
    Write-Host "FAILED - $($_.Exception.Message)" -ForegroundColor White
}

# Test 2: Chat info endpoint
try {
    $result2 = Invoke-RestMethod -Uri "$base/api/chat/$botId/info" -Method Get
    Write-Host "✅ Endpoint 2 (/api/chat/:id/info): " -NoNewline -ForegroundColor Green
    Write-Host "SUCCESS - Bot: $($result2.name)" -ForegroundColor White
} catch {
    Write-Host "❌ Endpoint 2 (/api/chat/:id/info): " -NoNewline -ForegroundColor Red
    Write-Host "FAILED - $($_.Exception.Message)" -ForegroundColor White
}

# Test 3: Public bots endpoint
try {
    $result3 = Invoke-RestMethod -Uri "$base/api/bots/public/$botId" -Method Get
    Write-Host "✅ Endpoint 3 (/api/bots/public/:id): " -NoNewline -ForegroundColor Green
    Write-Host "SUCCESS - Bot: $($result3.name)" -ForegroundColor White
} catch {
    Write-Host "❌ Endpoint 3 (/api/bots/public/:id): " -NoNewline -ForegroundColor Red
    Write-Host "FAILED - $($_.Exception.Message)" -ForegroundColor White
}

Write-Host "`n"
```

### Browser JavaScript:
```javascript
// Paste this in browser console
(async () => {
  const botId = '675479cc5dd23d3cf41b9d33';
  const base = 'https://raghost-pcgw.onrender.com';
  
  console.log('🧪 Testing Widget Embed Endpoints...\n');
  
  const endpoints = [
    { name: 'Widget', url: `${base}/api/widget/bot/${botId}` },
    { name: 'Chat Info', url: `${base}/api/chat/${botId}/info` },
    { name: 'Public Bots', url: `${base}/api/bots/public/${botId}` }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint.url);
      const data = await res.json();
      if (res.ok && data.name) {
        console.log(`✅ ${endpoint.name}: SUCCESS - Bot: ${data.name}`);
      } else {
        console.log(`❌ ${endpoint.name}: FAILED -`, data.error || 'Unknown error');
      }
    } catch (err) {
      console.log(`❌ ${endpoint.name}: FAILED -`, err.message);
    }
  }
  
  console.log('\n✨ Test complete!');
})();
```

### Curl (Linux/Mac):
```bash
# Test all three endpoints
BOT_ID="675479cc5dd23d3cf41b9d33"
BASE="https://raghost-pcgw.onrender.com"

echo "🧪 Testing Widget Embed Endpoints..."
echo ""

# Test 1
echo "Testing: /api/widget/bot/:id"
curl -s "$BASE/api/widget/bot/$BOT_ID" | jq
echo ""

# Test 2
echo "Testing: /api/chat/:id/info"
curl -s "$BASE/api/chat/$BOT_ID/info" | jq
echo ""

# Test 3
echo "Testing: /api/bots/public/:id"
curl -s "$BASE/api/bots/public/$BOT_ID" | jq
echo ""
```

## Expected Success Response:
```json
{
  "id": "675479cc5dd23d3cf41b9d33",
  "name": "Your Bot Name",
  "type": "rag",
  "description": "Bot description",
  "color": "#6366F1",
  "status": "active",
  "createdAt": "2024-12-07T..."
}
```

## Expected Failure (Not Yet Deployed):
```json
{
  "success": false,
  "error": "Route not found: GET /api/widget/bot/..."
}
```

Or:
```json
{
  "success": false,
  "error": "No token provided. Please include Authorization: Bearer <token>"
}
```

---

## ⏰ Checking Deployment Status

Run this every 2-3 minutes until you see SUCCESS:

```powershell
# PowerShell - Quick check
Invoke-RestMethod -Uri "https://raghost-pcgw.onrender.com/health" | Select-Object success, status, uptime
```

When **uptime < 60 seconds**, the backend has restarted with new code!
