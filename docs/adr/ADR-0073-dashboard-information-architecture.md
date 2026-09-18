# ADR-0073 — Dashboard Information Architecture

## Status

* **Status:** Accepted
* **Date:** 2026-09-17

## Context

The dashboard needs a stable navigation model before concrete UI components are built.

## Decision

Use seven top-level analytics sections:

- Overview
- Revenue
- Customers
- Products
- Sessions
- Funnel
- Retention

The section model remains presentation-agnostic and does not own query execution.

## Consequences

Dashboard UI can be built against stable section identifiers without coupling navigation to commerce query implementations.
