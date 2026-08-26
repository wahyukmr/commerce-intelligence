# ADR-0020 — Continuous Deployment with Vercel and Post-Deployment E2E Verification

* **Status:** Accepted
* **Date:** 2026-08-17

---

## Context

The dashboard is a web application that needs frequent, reliable, low-friction deployment updates while preserving production quality.

Without a managed deployment flow:

* feature delivery slows down because deployments require manual coordination;
* production verification is inconsistent across releases;
* release confidence depends on ad hoc checks instead of a repeated pipeline;
* deployment regressions are harder to isolate after the fact.

The repository already uses GitHub Actions for CI, and the application is hosted on Vercel. A deployment workflow should therefore align with the existing engineering platform rather than creating a separate release mechanism.

---

## Decision

The repository adopts Vercel as the deployment platform for the dashboard and uses a post-deployment verification workflow triggered by Vercel deployment readiness events.

The deployment model is:

* Vercel handles production deployment for the dashboard;
* GitHub Actions listens for the `vercel.deployment.ready` repository event;
* the workflow checks out the deployed commit and runs the browser E2E suite against the live deployment URL;
* the E2E result is reported back to Vercel so the deployment status reflects production validation.

The implementation lives in `.github/workflows/e2e.yml`.

---

## Rationale

Using Vercel with a deployment-triggered verification step provides:

* fast and repeatable production releases;
* direct alignment with the platform where the app runs;
* automated verification against the actual deployed environment;
* release visibility for both GitHub and Vercel stakeholders.

This approach reduces the risk of shipping a broken build by validating the runtime URL rather than only verifying source code in CI. It also preserves a clear feedback loop from deployment readiness to validation status.

---

## Consequences

### Positive

* Continuous deployment is streamlined and operationally simple.
* Production regressions are caught before being treated as fully healthy releases.
* Deployment health is visible in both GitHub and Vercel.
* E2E validation runs against the actual deployed URL, increasing confidence.

### Negative

* Deployment verification adds time to the release process.
* E2E runs depend on the runtime environment being reachable and stable.
* The workflow requires environment secrets and deployment metadata to be configured correctly.

---

## Alternatives Considered

### Manual Deployment Checks

Rejected.

Manual verification is slower, harder to repeat, and more error-prone. It also does not provide a consistent signal for every deployment.

### CI-Only Validation Without Vercel Deployment Trigger

Rejected.

A CI-only gate does not validate the deployed artifact itself. It can miss runtime issues caused by infrastructure, environment configuration, or deployment specifics.

---

## Review

Review when deployment strategy changes, the hosting platform changes, or the production validation workflow no longer matches the delivery model.
