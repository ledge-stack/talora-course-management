-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Constraint: Hard cap of at most 2 users with the class_rep role
CREATE OR REPLACE FUNCTION check_class_rep_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM users WHERE role = 'class_rep') >= 2 AND NEW.role = 'class_rep' THEN
        RAISE EXCEPTION 'Maximum limit of 2 Class Representatives reached.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_limit_class_rep ON users;
CREATE TRIGGER trg_limit_class_rep
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
WHEN (NEW.role = 'class_rep')
EXECUTE FUNCTION check_class_rep_limit();
