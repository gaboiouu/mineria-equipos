CREATE TABLE IF NOT EXISTS equipment_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  maintenance_interval_hours INT NOT NULL CHECK (maintenance_interval_hours > 0)
);

CREATE TABLE IF NOT EXISTS equipment (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type_id INT NOT NULL REFERENCES equipment_types(id),
  hour_meter NUMERIC(10,1) NOT NULL DEFAULT 0 CHECK (hour_meter >= 0),
  last_maintenance_hours NUMERIC(10,1) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS maintenance_history (
  id SERIAL PRIMARY KEY,
  equipment_id INT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  hour_meter_at_service NUMERIC(10,1) NOT NULL,
  notes TEXT
);

INSERT INTO equipment_types (name, maintenance_interval_hours) VALUES
  ('camion', 500),
  ('excavadora', 250),
  ('perforadora', 300)
ON CONFLICT (name) DO NOTHING;