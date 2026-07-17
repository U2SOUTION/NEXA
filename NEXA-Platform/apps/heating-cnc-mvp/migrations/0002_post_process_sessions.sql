-- Manual Overdrive sessions — [04 §G] [03 Manual Overdrive]

CREATE TABLE post_process_sessions (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  job_id INTEGER,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  utility_preset TEXT,
  utility_presets_json TEXT,
  energy_consumption_wh REAL,
  coordinate_drift_check_json TEXT,
  jog_ledger_summary_json TEXT,
  FOREIGN KEY (device_id) REFERENCES devices(id),
  FOREIGN KEY (job_id) REFERENCES job_logs(id)
);

CREATE INDEX idx_post_process_sessions_device ON post_process_sessions(device_id, started_at);
