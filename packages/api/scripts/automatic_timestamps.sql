CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified_at = NOW();
    IF NEW.created_at IS NULL THEN
        NEW.created_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    r RECORD;
    tname TEXT;
BEGIN
    FOR r IN (
        SELECT table_name AS tname
        FROM information_schema.columns
        WHERE column_name = 'modified_at'
    )
    LOOP
        tname := r.tname;
        
        EXECUTE format('
            CREATE TRIGGER set_timestamp_%I
            BEFORE INSERT OR UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_timestamp();
        ', tname, tname);
    END LOOP;
END $$;
