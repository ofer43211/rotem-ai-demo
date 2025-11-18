## Security Policy

We take the security of rotem-ai-demo seriously. If you have discovered a security vulnerability, we appreciate your help in disclosing it to us in a responsible manner.

### Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

### Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them using one of the following methods:

#### 1. GitHub Security Advisories (Recommended)

1. Go to the [Security tab](../../security/advisories)
2. Click "Report a vulnerability"
3. Fill out the form with details about the vulnerability

#### 2. Email

Send an email to the maintainers at:
- **Email:** [Insert security contact email]

Please include:
- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### What to Expect

After you submit a vulnerability report:

1. **Acknowledgment:** We will acknowledge receipt of your vulnerability report within 48 hours
2. **Communication:** We will send you regular updates about our progress
3. **Verification:** We will verify the vulnerability and determine its impact
4. **Fix Development:** We will work on a fix for the vulnerability
5. **Release:** We will release a security update
6. **Disclosure:** We will publicly disclose the vulnerability after the fix is released
7. **Credit:** We will give you credit for the discovery (unless you prefer to remain anonymous)

### Security Update Process

When a security vulnerability is confirmed:

1. A security advisory will be created (private)
2. A fix will be developed in a private repository
3. A new version will be released with the fix
4. The security advisory will be published
5. Users will be notified through:
   - GitHub Security Advisories
   - Release notes
   - CHANGELOG.md

### Security Best Practices

When using this project, we recommend:

#### 1. Keep Dependencies Updated

```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Audit for vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix
```

#### 2. Use Latest Version

Always use the latest stable version of the package.

#### 3. Review Dependencies

Before installing, review the package's dependencies:

```bash
npm ls
```

#### 4. Secure Configuration

- Never commit sensitive data (API keys, passwords, etc.)
- Use environment variables for configuration
- Enable strict mode in TypeScript
- Use proper input validation

#### 5. Security Tools

This project includes:
- **Dependabot:** Automatic dependency updates
- **CodeQL:** Code security analysis
- **npm audit:** Vulnerability scanning
- **ESLint:** Security-focused linting rules

### Known Security Considerations

#### Input Validation

This library performs validation for:
- Email addresses
- URLs
- Phone numbers
- Credit card numbers (Luhn algorithm)
- Age values
- Password strength

**Note:** While we strive for comprehensive validation, additional validation should be performed for security-critical applications.

#### Error Messages

Error messages may include contextual information. Be careful not to expose sensitive data in error contexts.

#### Database Mock

The included database layer is a **mock implementation** for testing purposes only. Do not use it in production with sensitive data.

#### Logging

The Logger utility logs to console in non-production environments. Ensure you:
- Don't log sensitive information
- Configure appropriate log levels for production
- Implement secure log storage if needed

### Security Features

This project includes:

#### 1. Custom Error Handling

- Error codes and types for better error handling
- Context support (be careful not to include sensitive data)
- Operational vs. programming errors

#### 2. Rate Limiting

```typescript
import { RateLimiter } from 'rotem-ai-demo';

const limiter = new RateLimiter({
  maxTokens: 100,
  refillRate: 10,
});

// Limit API calls
await limiter.execute(async () => {
  // Your API call
});
```

#### 3. Circuit Breaker

```typescript
import { CircuitBreaker } from 'rotem-ai-demo';

const breaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 60000,
});

// Protect against cascading failures
await breaker.execute(async () => {
  // Your operation
});
```

#### 4. Retry with Backoff

```typescript
import { RetryHandler } from 'rotem-ai-demo';

const retry = new RetryHandler({
  maxRetries: 3,
  initialDelay: 1000,
});

// Retry failed operations
await retry.execute(async () => {
  // Your operation
});
```

### Vulnerability Disclosure Timeline

We aim to:
- Acknowledge receipt within **48 hours**
- Provide an initial assessment within **5 business days**
- Release a fix within **30 days** for high-severity issues
- Release a fix within **90 days** for medium/low-severity issues

### Scope

#### In Scope

- Authentication/Authorization bypass
- Remote Code Execution (RCE)
- SQL Injection
- Cross-Site Scripting (XSS)
- Cross-Site Request Forgery (CSRF)
- Sensitive data exposure
- Security misconfigurations
- Vulnerable dependencies

#### Out of Scope

- Social engineering attacks
- Physical attacks
- Denial of Service (DoS) attacks
- Issues in third-party dependencies (report to the dependency maintainers)
- Issues requiring physical access to a user's device

### Preferred Languages

We prefer all communications to be in **English** or **Hebrew**.

### Recognition

We maintain a security hall of fame to recognize security researchers who have helped us improve the security of our project.

### Safe Harbor

We support safe harbor for security researchers who:

- Make a good faith effort to avoid privacy violations, destruction of data, and interruption or degradation of our services
- Only interact with accounts you own or with explicit permission of the account holder
- Do not exploit a security issue for purposes other than verification
- Give us reasonable time to fix the issue before public disclosure

### Questions

If you have questions about this security policy, please create an issue or contact the maintainers.

---

**Last Updated:** 2025-01-18

**Security Policy Version:** 1.0.0
