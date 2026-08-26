# Security Policy

This document defines the security practices and expectations for the Commerce Intelligence monorepo.

Although this repository is private, every contributor is responsible for protecting source code, credentials, infrastructure, and sensitive business data.

---

# Table of Contents

* Scope
* Security Principles
* Responsible Disclosure
* Secrets Management
* Environment Variables
* Dependency Security
* Source Code Security
* Authentication & Authorization
* Logging
* Data Protection
* CI/CD Security
* Git Security
* Third-Party Dependencies
* Security Review Checklist
* Incident Response

---

# Scope

This policy applies to:

* all applications
* all internal packages
* CI/CD workflows
* development tooling
* documentation
* infrastructure-related configuration

Every contribution is expected to follow this policy.

---

# Security Principles

The repository follows these principles.

* Least Privilege
* Fail Securely
* Secure by Default
* Explicit Trust Boundaries
* Defense in Depth
* Principle of Minimal Exposure

Security should be designed into the implementation rather than added afterwards.

---

# Responsible Disclosure

If a security issue is discovered:

1. Do not create a public issue.
2. Notify the repository maintainers privately.
3. Include reproduction steps.
4. Include the affected package.
5. Include the potential impact.
6. Wait for acknowledgement before discussing publicly.

Security issues should always receive higher priority than feature work.

---

# Secrets Management

Secrets must never be committed to Git.

Examples include:

* API keys
* access tokens
* private certificates
* SSH keys
* OAuth credentials
* JWT secrets
* database passwords
* cloud credentials

Forbidden:

```text id="wqcxh8"
.env

.env.production

.env.local
```

Allowed:

```text id="xzqfiu"
.env.example
```

Example values must never contain real credentials.

---

# Environment Variables

Environment variables must be validated through `@ci/config-env`.

Never access environment variables directly throughout the codebase.

Correct:

```ts id="ukg1rq"
import { serverEnv } from '@ci/config-env/server';

serverEnv.DATABASE_URL;
```

Incorrect:

```ts id="hnrk7t"
process.env.DATABASE_URL;
```

Validation must occur during application startup.

Applications should fail fast when required configuration is missing.

---

# Dependency Security

Dependencies should satisfy the following requirements.

* actively maintained
* widely adopted
* compatible license
* no known critical vulnerabilities
* clear release history

Avoid introducing dependencies that duplicate existing functionality.

Before adding a dependency, ask:

* Can this be implemented internally?
* Does another dependency already provide this functionality?
* Is the maintenance cost justified?

---

# Source Code Security

Avoid introducing unnecessary attack surface.

Examples:

* avoid dynamic code execution;
* validate external input;
* sanitize user-provided data;
* validate file paths;
* validate URLs before use.

Never assume external input is trusted.

---

# Input Validation

All external input should be validated at system boundaries.

Examples:

* HTTP requests
* environment variables
* configuration files
* uploaded files
* external APIs

Prefer schema-based validation.

Example:

```ts id="pzmzmn"
const result = schema.parse(input);
```

Avoid unchecked type assertions.

---

# Authentication

Authentication logic belongs to the application or dedicated authentication layer.

Business packages should not implement authentication mechanisms.

Commerce packages should assume that authenticated identity has already been established.

---

# Authorization

Authorization rules should be explicit.

Avoid implicit permission checks scattered throughout the codebase.

Authorization decisions should be centralized and testable.

---

# Logging

Logs must never expose sensitive information.

Never log:

* passwords
* access tokens
* refresh tokens
* session identifiers
* private keys
* personally identifiable information

If logging user data is necessary for diagnostics, redact sensitive fields.

---

# Error Messages

Error messages should provide useful diagnostics without leaking sensitive information.

Good:

```text id="g7eqj5"
Authentication failed.
```

Avoid:

```text id="2lkc6r"
Password for user admin does not match hash ...
```

Internal implementation details should remain internal.

---

# Data Protection

Sensitive data should remain encrypted whenever appropriate.

Examples:

* credentials
* payment information
* personal information

Avoid storing sensitive information in:

* logs
* temporary files
* exception messages

---

# File Uploads

When accepting uploaded files:

* validate MIME type;
* validate file size;
* validate extension;
* validate filename;
* reject executable content unless explicitly required.

Never trust client-provided metadata alone.

---

# HTTP Security

Applications communicating over HTTP should:

* enforce HTTPS in production;
* validate remote endpoints;
* configure reasonable request timeouts;
* implement retry policies where appropriate.

Do not disable TLS verification.

---

# Third-Party Dependencies

Before introducing a dependency:

* review repository activity;
* review maintenance status;
* review open security advisories;
* review license compatibility.

Dependencies with no maintenance history should generally be avoided.

---

# Continuous Integration

Every pull request must successfully complete:

* lint
* typecheck
* tests
* build

CI failures block merging.

Future enhancements may include:

* dependency vulnerability scanning;
* secret scanning;
* license compliance;
* Software Bill of Materials (SBOM).

---

# Git Security

Do not commit:

* generated secrets;
* production configuration;
* local certificates;
* debugging artifacts.

Review staged changes before every commit.

Recommended:

```bash id="d0l7kq"
git diff --cached
```

---

# Branch Protection

The default branch should enforce:

* required pull requests;
* required status checks;
* linear history (optional);
* squash merge;
* restricted direct pushes.

Only reviewed code should reach the default branch.

---

# Security Review Checklist

Before merging, verify:

* No secrets committed.
* Environment variables validated.
* External input validated.
* Sensitive information not logged.
* New dependencies reviewed.
* Documentation updated if security behavior changed.
* Tests include security-relevant scenarios where applicable.

---

# Incident Response

If a security incident occurs:

1. Contain the issue.
2. Assess the impact.
3. Notify maintainers.
4. Identify affected systems.
5. Prepare a fix.
6. Review the root cause.
7. Update documentation or processes to prevent recurrence.

The objective is not only to resolve the immediate issue but also to reduce the likelihood of similar incidents in the future.
