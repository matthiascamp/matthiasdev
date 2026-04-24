-- MCBook — Required database migrations
-- Run these in your Supabase SQL editor (project → SQL editor)

-- ── 1. Unique constraint on customers(client_id, email) ────────────────────
-- Prevents duplicate customer rows when two concurrent bookings arrive with
-- the same email. The widget handles the 23505 conflict error gracefully.
CREATE UNIQUE INDEX IF NOT EXISTS customers_client_email_unique
  ON customers(client_id, email);

-- ── 2. Index on bookings(date) for the send-reminders cron query ───────────
CREATE INDEX IF NOT EXISTS bookings_date_idx ON bookings(date);

-- ── 3. Index on bookings(status) for faster active-booking queries ──────────
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings(status);

-- ── 4. Business mode on clients (service | restaurant) ───────────────────────
ALTER TABLE clients ADD COLUMN IF NOT EXISTS business_mode TEXT DEFAULT 'service'
  CHECK (business_mode IN ('service', 'restaurant'));

-- ── 5. Total capacity on booking_settings (for restaurant mode) ───────────────
ALTER TABLE booking_settings ADD COLUMN IF NOT EXISTS total_capacity INTEGER;

-- ── 6. Party size on bookings ────────────────────────────────────────────────
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS party_size INTEGER DEFAULT 1;

-- ── 7. Seating areas table ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seating_areas (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id  UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  capacity   INTEGER NOT NULL,
  active     BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS seating_areas_client_idx ON seating_areas(client_id);

-- ── 8. Seating area foreign key on bookings ──────────────────────────────────
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS seating_area_id UUID
  REFERENCES seating_areas(id) ON DELETE SET NULL;

-- ── QUERY: Restaurants with available capacity at a given date/time ──────────
-- Replace the date and time values to find open slots across all restaurants.
-- Run this in the Supabase SQL editor.
--
-- SELECT
--   c.id,
--   c.business_name,
--   bs.total_capacity,
--   COALESCE(SUM(b.party_size), 0)                             AS booked_covers,
--   bs.total_capacity - COALESCE(SUM(b.party_size), 0)         AS available_covers
-- FROM clients c
-- JOIN booking_settings bs ON bs.client_id = c.id
-- LEFT JOIN bookings b
--   ON  b.client_id = c.id
--   AND b.date       = '2026-04-18'   -- ← change date
--   AND b.time       = '19:00'        -- ← change time (HH:MM 24h)
--   AND b.status    NOT IN ('cancelled')
-- WHERE c.business_mode = 'restaurant'
--   AND bs.total_capacity IS NOT NULL
-- GROUP BY c.id, c.business_name, bs.total_capacity
-- HAVING bs.total_capacity - COALESCE(SUM(b.party_size), 0) > 0
-- ORDER BY available_covers DESC;

-- ── 9. Booking audit log ─────────────────────────────────────────────────────
-- Automatic database-level log of every booking change. If anything ever goes
-- wrong, this table has the full before/after state of every insert, update,
-- and delete — regardless of which code path or edge function triggered it.
CREATE TABLE IF NOT EXISTS booking_audit_log (
  id          BIGSERIAL    PRIMARY KEY,
  booking_id  UUID         NOT NULL,
  client_id   UUID,
  action      TEXT         NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data    JSONB,
  new_data    JSONB,
  changed_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS booking_audit_log_booking_idx ON booking_audit_log(booking_id);
CREATE INDEX IF NOT EXISTS booking_audit_log_client_idx  ON booking_audit_log(client_id);
CREATE INDEX IF NOT EXISTS booking_audit_log_time_idx    ON booking_audit_log(changed_at);

CREATE OR REPLACE FUNCTION log_booking_change() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO booking_audit_log (booking_id, client_id, action, old_data)
    VALUES (OLD.id, OLD.client_id, 'DELETE', to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO booking_audit_log (booking_id, client_id, action, old_data, new_data)
    VALUES (NEW.id, NEW.client_id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO booking_audit_log (booking_id, client_id, action, new_data)
    VALUES (NEW.id, NEW.client_id, 'INSERT', to_jsonb(NEW));
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS booking_audit_trigger ON bookings;
CREATE TRIGGER booking_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW EXECUTE FUNCTION log_booking_change();

-- RLS: allow authenticated users to read their own client's audit log
ALTER TABLE booking_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own audit log"
  ON booking_audit_log FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Service role full access to audit log"
  ON booking_audit_log FOR ALL
  USING (true)
  WITH CHECK (true);
