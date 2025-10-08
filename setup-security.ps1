# Security Setup Script
# Run this to install git hooks that prevent committing sensitive files

Write-Host "Setting up security git hooks..." -ForegroundColor Cyan

# Copy pre-commit hook
$hookPath = ".git\hooks\pre-commit"
$hookTemplate = @"
#!/bin/sh
# Pre-commit hook to prevent committing sensitive files

# Check for sensitive files
FORBIDDEN_PATTERNS="\.env$ firebase-service-account\.json$ RENDER_ENV VERCEL_ENV FIREBASE_CREDENTIALS"

echo "Checking for sensitive files..."

for pattern in `$FORBIDDEN_PATTERNS; do
  if git diff --cached --name-only | grep -E "`$pattern"; then
    echo "BLOCKED: Attempting to commit sensitive file matching: `$pattern"
    echo "Please unstage this file and add it to .gitignore"
    exit 1
  fi
done

# Check for private keys in content
if git diff --cached | grep -q "BEGIN PRIVATE KEY"; then
  echo "BLOCKED: Private key detected in staged changes!"
  exit 1
fi

echo "Security check passed"
exit 0
"@

# Create the hook file
Set-Content -Path $hookPath -Value $hookTemplate -NoNewline

Write-Host "Pre-commit hook installed!" -ForegroundColor Green
Write-Host ""
Write-Host "This hook will:" -ForegroundColor Yellow
Write-Host "  - Prevent committing .env files" -ForegroundColor White
Write-Host "  - Prevent committing firebase-service-account.json" -ForegroundColor White
Write-Host "  - Detect private keys in staged content" -ForegroundColor White
Write-Host "  - Block commits with sensitive data" -ForegroundColor White
Write-Host ""
Write-Host "Your repository is now protected!" -ForegroundColor Green
