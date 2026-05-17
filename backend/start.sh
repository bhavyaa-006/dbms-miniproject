#!/bin/sh
set -e

echo "Waiting for PostgreSQL to start..."
# Note: docker-compose wait condition handles the main wait, but this is a fallback
sleep 2 

# Ensure the database tables are created and seeded if empty
echo "Applying database schemas and initial seed data..."
# python -m app.seed

# Apply the PostgreSQL trigger
echo "Applying PostgreSQL triggers..."
export PGPASSWORD=$POSTGRES_PASSWORD
# Extract connection details from DATABASE_URL
# Format: postgresql://user:pass@host:port/dbname
DB_USER=$(echo $DATABASE_URL | sed -E 's/.*:\/\/(.*):.*@.*/\1/')
DB_HOST=$(echo $DATABASE_URL | sed -E 's/.*@(.*):.*/\1/')
DB_NAME=$(echo $DATABASE_URL | sed -E 's/.*\/(.*)/\1/')

# Use python to execute the SQL file since psql might not be available in the slim image
python -c "
import os
import sys
from sqlalchemy import create_engine, text

db_url = os.environ.get('DATABASE_URL')
if not db_url:
    print('DATABASE_URL not set')
    sys.exit(1)

try:
    engine = create_engine(db_url)
    # Let's write the trigger directly here for the docker environment to ensure it runs
    trigger_sql = \"\"\"
    CREATE OR REPLACE FUNCTION fn_handle_claim_status_change()
    RETURNS TRIGGER AS \$\$
    BEGIN
        IF NEW.status = 'APPROVED' AND (OLD.status IS NULL OR OLD.status != 'APPROVED') THEN
            UPDATE found_items SET status = 'CLAIMED' WHERE id = NEW.found_item_id;
            INSERT INTO notifications (id, user_id, message, is_read, created_at)
            SELECT gen_random_uuid()::text, NEW.claimant_id, '✅ [DB Trigger] Your claim has been APPROVED! Please collect your item.', false, NOW();
        END IF;
        IF NEW.status = 'REJECTED' AND (OLD.status IS NULL OR OLD.status != 'REJECTED') THEN
            INSERT INTO notifications (id, user_id, message, is_read, created_at)
            SELECT gen_random_uuid()::text, NEW.claimant_id, '❌ [DB Trigger] Your claim has been REJECTED. Please contact admin for details.', false, NOW();
        END IF;
        RETURN NEW;
    END;
    \$\$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trg_claim_status_change ON claims;
    CREATE TRIGGER trg_claim_status_change
        AFTER UPDATE ON claims
        FOR EACH ROW
        EXECUTE FUNCTION fn_handle_claim_status_change();
    \"\"\"
    
    with engine.begin() as conn:
        conn.execute(text(trigger_sql))
    print('Trigger applied successfully via SQLAlchemy.')
except Exception as e:
    print(f'Error applying trigger: {e}')
"

echo "Starting FastAPI server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
