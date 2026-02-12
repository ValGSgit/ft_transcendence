# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

**DO NOT** open public issues for security vulnerabilities.

Instead:
1. Email: security@[your-domain].com
2. Include detailed description
3. Provide steps to reproduce
4. Suggest fixes if possible

We will respond within 48 hours.

## Security Measures

- JWT with secure secrets
- Bcrypt password hashing (10 rounds)
- Helmet.js security headers
- CORS configuration
- Rate limiting on API endpoints
- Input validation
- SQL injection prevention (prepared statements)
- XSS protection

## Best Practices

- Change JWT_SECRET in production
- Use HTTPS in production
- Enable 2FA for admin accounts
- Regular dependency updates
- Monitor security advisories
