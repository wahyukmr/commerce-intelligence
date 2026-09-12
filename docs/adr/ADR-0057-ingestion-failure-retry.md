# ADR-0057 — Ingestion Failure and Retry Semantics

## Status

* **Status:** Accepted
* **Date:** 2026-09-11

## Context

The ingestion boundary can fail while processing a valid event. Without explicit failure classification, callers cannot distinguish retryable infrastructure failures from permanent event failures.

## Decision

Introduce explicit transient/permanent failure classification and a bounded retry policy. Runtime ingestion uses the same runtime event-id deduplication on retries. The event journal is appended after successful runtime ingestion so an unsuccessful runtime attempt is not incorrectly converted into a duplicate on the next attempt.

## Consequences

Transient failures can be retried with bounded backoff. Permanent failures stop immediately. Runtime remains the owner of in-process deduplication. Durable event storage remains replaceable behind `EventStore`.
