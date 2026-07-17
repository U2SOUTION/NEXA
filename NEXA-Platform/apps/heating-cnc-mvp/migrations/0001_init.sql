-- Heating CNC MVP v0.1 — D1 canonical schema
-- Spec: NEXA V2.0/Heating_CNC/04-Data-Operations.md

CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE TABLE devices (
  id TEXT PRIMARY KEY,
  project_id INTEGER NOT NULL,
  device_type TEXT NOT NULL,
  display_name TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE INDEX idx_devices_project ON devices(project_id);

CREATE TABLE device_credentials (
  device_id TEXT PRIMARY KEY,
  secret_hash TEXT NOT NULL,
  provisioned_at TEXT NOT NULL,
  provisioned_by_user_id INTEGER,
  last_rotated_at TEXT,
  revoked_at TEXT,
  fw_version TEXT,
  FOREIGN KEY (device_id) REFERENCES devices(id)
);

CREATE TABLE wire_installations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL,
  profile_id INTEGER,
  serial_label TEXT,
  installed_at TEXT NOT NULL,
  retired_at TEXT,
  retire_reason TEXT,
  r0_cold_ohm REAL NOT NULL,
  wire_length_mm REAL,
  wire_diameter_mm REAL,
  rated_on_hours REAL DEFAULT 48,
  rated_energy_wh REAL,
  notes TEXT,
  FOREIGN KEY (device_id) REFERENCES devices(id)
);

CREATE INDEX idx_wire_installations_device ON wire_installations(device_id);
CREATE INDEX idx_wire_installations_active ON wire_installations(device_id, retired_at);

CREATE TABLE wire_runtime_counters (
  installation_id INTEGER PRIMARY KEY,
  on_time_sec REAL NOT NULL DEFAULT 0,
  preheat_time_sec REAL NOT NULL DEFAULT 0,
  energy_wh REAL NOT NULL DEFAULT 0,
  thermal_stress_wh REAL NOT NULL DEFAULT 0,
  peak_power_w REAL DEFAULT 0,
  avg_power_w_ema REAL,
  max_wire_temp_c REAL DEFAULT 0,
  last_resistance_ohm REAL,
  last_drift_pct REAL DEFAULT 0,
  pm_health_score REAL DEFAULT 1.0,
  s1_risk_estimate REAL DEFAULT 0,
  updated_at TEXT,
  FOREIGN KEY (installation_id) REFERENCES wire_installations(id)
);

CREATE TABLE wire_runtime_hourly (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  installation_id INTEGER NOT NULL,
  hour_ts TEXT NOT NULL,
  on_time_sec REAL NOT NULL DEFAULT 0,
  energy_wh REAL NOT NULL DEFAULT 0,
  avg_power_w REAL,
  max_power_w REAL,
  avg_drift_pct REAL,
  avg_health_score REAL,
  sample_count INTEGER DEFAULT 0,
  UNIQUE(installation_id, hour_ts),
  FOREIGN KEY (installation_id) REFERENCES wire_installations(id)
);

CREATE INDEX idx_wire_runtime_hourly_inst ON wire_runtime_hourly(installation_id, hour_ts);

CREATE TABLE recipes (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  length_mm REAL,
  diameter_mm REAL,
  material_density_factor REAL NOT NULL DEFAULT 1.0,
  target_voltage REAL,
  feed_rate REAL,
  gcode_template TEXT,
  stallguard_json TEXT,
  resume_policy_json TEXT,
  cam_edge_case_json TEXT
);

CREATE TABLE job_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL DEFAULT 1,
  device_id TEXT NOT NULL DEFAULT 'turning-01',
  started_at TEXT,
  finished_at TEXT,
  recipe_id INTEGER,
  duration_sec REAL,
  power_wh REAL,
  max_temp REAL,
  wire_installation_id INTEGER,
  pause_reason TEXT,
  resume_checkpoint_json TEXT,
  scan_result_json TEXT,
  status TEXT,
  run_mode TEXT NOT NULL DEFAULT 'live',
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (device_id) REFERENCES devices(id),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id),
  FOREIGN KEY (wire_installation_id) REFERENCES wire_installations(id)
);

CREATE INDEX idx_job_logs_project ON job_logs(project_id);
CREATE INDEX idx_job_logs_device ON job_logs(device_id);
CREATE INDEX idx_job_logs_project_device ON job_logs(project_id, device_id);

CREATE TABLE thermal_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  wire_length_mm REAL,
  wire_diameter_mm REAL,
  resistance_per_m REAL,
  psu_voltage_nom REAL DEFAULT 18,
  pwm_min INTEGER DEFAULT 0,
  pwm_max INTEGER DEFAULT 1000,
  pwm_ramp_ms INTEGER DEFAULT 500,
  current_limit_a REAL DEFAULT 3.5,
  preheat_json TEXT,
  preheat_gate_json TEXT,
  thermal_tau_sec REAL DEFAULT 2.0,
  t_ambient_c REAL DEFAULT 25,
  target_temp_c REAL DEFAULT 300,
  nichrome_alpha REAL DEFAULT 0.0001,
  r0_baseline_ohm REAL,
  ina219_ma_window INTEGER DEFAULT 5,
  i_break_floor_a REAL DEFAULT 0.02,
  i_break_ratio REAL DEFAULT 0.15,
  i_nom_max_a REAL DEFAULT 3.0,
  temp_curve_json TEXT,
  updated_at TEXT
);

CREATE TABLE thermal_test_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id INTEGER,
  started_at TEXT,
  finished_at TEXT,
  test_type TEXT,
  run_mode TEXT,
  max_current_a REAL,
  max_pwm INTEGER,
  max_wire_temp_c REAL,
  samples_json TEXT,
  notes TEXT
);

CREATE TABLE engine_coefficients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id INTEGER NOT NULL UNIQUE,
  thermal_k REAL,
  pwm_gain REAL DEFAULT 1.0,
  v_offset REAL DEFAULT 0,
  v_offset_per_rho REAL DEFAULT 0.8,
  resistance_per_m REAL,
  s_to_power_json TEXT,
  fit_source_log_id INTEGER,
  fit_version INTEGER DEFAULT 1,
  fit_rmse REAL,
  updated_at TEXT,
  FOREIGN KEY (profile_id) REFERENCES thermal_profiles(id),
  FOREIGN KEY (fit_source_log_id) REFERENCES thermal_test_logs(id)
);

CREATE TABLE wire_pm_policy (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id INTEGER,
  device_id TEXT,
  drift_warn_pct REAL DEFAULT 15,
  drift_crit_pct REAL DEFAULT 25,
  on_hours_warn REAL DEFAULT 40,
  on_hours_crit REAL DEFAULT 46,
  power_eff_warn REAL DEFAULT 0.85,
  health_score_replace REAL DEFAULT 0.25,
  s1_risk_alert REAL DEFAULT 0.70,
  lead_time_hours REAL DEFAULT 4,
  updated_at TEXT,
  FOREIGN KEY (profile_id) REFERENCES thermal_profiles(id),
  FOREIGN KEY (device_id) REFERENCES devices(id)
);

CREATE TABLE wire_sensor_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER,
  test_log_id INTEGER,
  project_id INTEGER,
  device_id TEXT,
  ts TEXT,
  bus_v REAL,
  shunt_a REAL,
  wire_res_ohm REAL,
  wire_temp_c REAL,
  pwm_actual INTEGER,
  resistance_drift_pct REAL,
  scenario_flags TEXT,
  FOREIGN KEY (job_id) REFERENCES job_logs(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (device_id) REFERENCES devices(id)
);

CREATE TABLE wire_pm_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  installation_id INTEGER NOT NULL,
  device_id TEXT NOT NULL,
  ts TEXT NOT NULL DEFAULT (datetime('now')),
  level TEXT NOT NULL,
  trigger TEXT NOT NULL,
  message TEXT,
  metrics_json TEXT,
  s1_risk_estimate REAL,
  acknowledged_at TEXT,
  acted_at TEXT,
  FOREIGN KEY (installation_id) REFERENCES wire_installations(id),
  FOREIGN KEY (device_id) REFERENCES devices(id)
);

CREATE INDEX idx_wire_pm_alerts_inst ON wire_pm_alerts(installation_id, ts);
CREATE INDEX idx_wire_pm_alerts_open ON wire_pm_alerts(device_id, acknowledged_at);

CREATE TABLE fail_safe_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER,
  device_id TEXT NOT NULL,
  job_id INTEGER,
  ts TEXT NOT NULL DEFAULT (datetime('now')),
  reason TEXT NOT NULL,
  run_mode TEXT,
  actions_json TEXT,
  recovered_at TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (device_id) REFERENCES devices(id),
  FOREIGN KEY (job_id) REFERENCES job_logs(id)
);

INSERT INTO projects (id, slug, name) VALUES (1, 'mvp-default', 'MVP 조기 운영');
INSERT INTO devices (id, project_id, device_type, display_name)
  VALUES ('turning-01', 1, 'turning_4axis', '4축 핫블레이드 터닝 머신');
