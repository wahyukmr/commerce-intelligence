CREATE TABLE IF NOT EXISTS runtime_recovery_state (
  tenant_id TEXT PRIMARY KEY,
  sequence BIGINT NOT NULL CHECK (sequence >= 0),
  snapshot JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS runtime_recovery_state_updated_at_idx
  ON runtime_recovery_state (updated_at);
