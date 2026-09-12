import { describe, expect, it } from "vitest";
import {
  assertBodySize,
  assertContentType,
  assertRequestHeaders,
  WebhookSecurityError,
} from "./webhook-security.js";

describe("webhook security", () => {
  it("rejects bodies larger than the configured limit", () => {
    expect(() => assertBodySize("123456", { maxBodyBytes: 5 })).toThrow(WebhookSecurityError);
  });

  it("requires configured headers", () => {
    const request = new Request("https://example.com", {
      headers: {
        "content-type": "application/json",
      },
    });

    expect(() =>
      assertRequestHeaders(request, {
        requiredHeaders: ["x-tenant-key"],
      }),
    ).toThrow(WebhookSecurityError);
  });

  it("validates the media type independently from charset parameters", () => {
    const request = new Request("https://example.com", {
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    });

    expect(() =>
      assertContentType(request, {
        allowedContentTypes: ["application/json"],
      }),
    ).not.toThrow();
  });
});
