# ADR-0059 — Webhook Security Hardening

## Status

* **Status:** Accepted
* **Date:** 2026-09-11

## Context

Signed webhooks still need basic request hardening against oversized payloads and requests missing deployment-required headers.

## Decision

Add configurable body-size limits, allowed content types, and required request headers to the existing `HttpWebhookAdapter`. Signature verification remains mandatory when configured. No authentication provider or rate-limiting service is embedded in the runtime package.

## Consequences

Applications can enforce inexpensive request-level controls before JSON parsing and runtime ingestion. Provider-specific authentication remains outside the generic runtime boundary.
