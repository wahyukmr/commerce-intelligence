CREATE TABLE IF NOT EXISTS commerce_events (
  sequence BIGSERIAL PRIMARY KEY,
  id TEXT NOT NULL UNIQUE,
  tenant_id TEXT NOT NULL,
  type TEXT NOT NULL,
  version INTEGER NOT NULL CHECK (version >= 1),
  occurred_at TIMESTAMPTZ NOT NULL,
  payload JSONB NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS commerce_events_tenant_sequence_idx
  ON commerce_events (tenant_id, sequence);

CREATE INDEX IF NOT EXISTS commerce_events_tenant_occurred_idx
  ON commerce_events (tenant_id, occurred_at);
