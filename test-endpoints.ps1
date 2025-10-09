Write-Host "`n🧪 RAGHost Widget Endpoint Tester" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

$botId = "675479cc5dd23d3cf41b9d33"
$base = "https://raghost-pcgw.onrender.com"

# Check health first
Write-Host "📊 Checking backend health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$base/health" -Method Get -TimeoutSec 10
    Write-Host "✅ Backend is " -NoNewline -ForegroundColor Green
    Write-Host $health.status -ForegroundColor White
    Write-Host "   Uptime: $([math]::Round($health.uptime, 2))s" -ForegroundColor Gray
    
    if ($health.uptime -lt 120) {
        Write-Host "   🔄 Recently restarted - new deployment detected!" -ForegroundColor Green
    } else {
        Write-Host "   ⏰ Running for $([math]::Round($health.uptime / 60, 1)) minutes" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "❌ Backend unreachable: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test endpoints
Write-Host "🔍 Testing widget endpoints...`n" -ForegroundColor Yellow

$endpoints = @(
    @{Name="Widget Endpoint"; Url="$base/api/widget/bot/$botId"; Priority="PRIMARY"},
    @{Name="Chat Info Endpoint"; Url="$base/api/chat/$botId/info"; Priority="FALLBACK 1"},
    @{Name="Public Bots Endpoint"; Url="$base/api/bots/public/$botId"; Priority="FALLBACK 2"}
)

$successCount = 0

foreach ($endpoint in $endpoints) {
    Write-Host "[$($endpoint.Priority)] " -NoNewline -ForegroundColor Cyan
    Write-Host "$($endpoint.Name):" -NoNewline
    
    try {
        $result = Invoke-RestMethod -Uri $endpoint.Url -Method Get -TimeoutSec 10
        
        if ($result.name) {
            Write-Host " ✅ SUCCESS" -ForegroundColor Green
            Write-Host "   Bot Name: " -NoNewline -ForegroundColor Gray
            Write-Host $result.name -ForegroundColor White
            Write-Host "   Bot Type: " -NoNewline -ForegroundColor Gray
            Write-Host $result.type -ForegroundColor White
            $successCount++
        } else {
            Write-Host " ⚠️  UNEXPECTED RESPONSE" -ForegroundColor Yellow
            Write-Host ($result | ConvertTo-Json -Compress) -ForegroundColor Gray
        }
    } catch {
        $errorMsg = $_.ErrorDetails.Message
        if ($errorMsg) {
            try {
                $errorObj = $errorMsg | ConvertFrom-Json
                Write-Host " ❌ FAILED" -ForegroundColor Red
                Write-Host "   Error: " -NoNewline -ForegroundColor Gray
                Write-Host $errorObj.error -ForegroundColor White
            } catch {
                Write-Host " ❌ FAILED" -ForegroundColor Red
                Write-Host "   Error: $errorMsg" -ForegroundColor Gray
            }
        } else {
            Write-Host " ❌ FAILED" -ForegroundColor Red
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
        }
    }
    Write-Host ""
}

# Summary
Write-Host "================================" -ForegroundColor Cyan
if ($successCount -gt 0) {
    Write-Host "✅ $successCount/$($endpoints.Count) endpoints working!" -ForegroundColor Green
    Write-Host "🎉 Your widget embeds should now work!" -ForegroundColor Green
} else {
    Write-Host "❌ All endpoints failed" -ForegroundColor Red
    Write-Host "⏳ Waiting for Render deployment..." -ForegroundColor Yellow
    Write-Host "💡 Try again in 2-3 minutes" -ForegroundColor Yellow
}
Write-Host ""

# Test the actual widget page
Write-Host "🔗 Widget URL:" -ForegroundColor Cyan
Write-Host "   https://rag-host.vercel.app/embed/$botId" -ForegroundColor White
Write-Host ""
