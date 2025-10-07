# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in RAGHost, please report it by emailing the maintainers directly rather than using the public issue tracker.

**Please do NOT create a public GitHub issue for security vulnerabilities.**

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Time

- We will acknowledge receipt of your vulnerability report within 48 hours
- We will provide a more detailed response within 7 days
- We will work on a fix and keep you updated on progress

## Security Best Practices

When deploying RAGHost:

1. **Environment Variables**: Never commit `.env` files or expose API keys
2. **Firebase Rules**: Configure proper Firestore and Firebase Auth rules
3. **MongoDB**: Use strong passwords and IP whitelist
4. **HTTPS**: Always use HTTPS in production
5. **API Keys**: Rotate API keys regularly
6. **Dependencies**: Keep dependencies updated
7. **CORS**: Configure CORS properly for your domain
8. **Rate Limiting**: Enable rate limiting for API endpoints

## Known Security Considerations

- User data is encrypted at rest in MongoDB
- API keys are encrypted in the database
- Firebase handles authentication securely
- All API routes require authentication except public chat endpoints
- CORS is configured for specific origins

## Updates

Security updates will be released as patch versions and documented in the CHANGELOG.md file.

Thank you for helping keep RAGHost secure!
