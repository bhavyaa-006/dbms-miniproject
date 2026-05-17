-- =============================================================================
-- Campus Lost & Found Management System
-- PostgreSQL Trigger: Auto-update FoundItem status when Claim is APPROVED
-- =============================================================================
-- DBMS Concept: Trigger — a stored procedure that automatically runs
-- in response to INSERT/UPDATE/DELETE events on a table.
-- =============================================================================

-- Step 1: Create the trigger function
CREATE OR REPLACE FUNCTION fn_handle_claim_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- When a claim transitions TO "APPROVED"
    IF NEW.status = 'APPROVED' AND (OLD.status IS NULL OR OLD.status != 'APPROVED') THEN

        -- Automatically mark the found item as CLAIMED
        UPDATE found_items
        SET status = 'CLAIMED'
        WHERE id = NEW.found_item_id;

        -- Insert a success notification for the claimant
        INSERT INTO notifications (id, recipient_user_id, title, type, message, is_read, created_at, related_claim_id, related_item_id)
        SELECT
            gen_random_uuid()::text,
            NEW.claimant_id,
            'Claim Approved',
            'CLAIM_APPROVED',
            '✅ [DB Trigger] Your claim has been APPROVED! Please collect your item.',
            false,
            NOW(),
            NEW.id,
            NEW.found_item_id;

    END IF;

    -- When a claim transitions TO "REJECTED"
    IF NEW.status = 'REJECTED' AND (OLD.status IS NULL OR OLD.status != 'REJECTED') THEN

        -- Insert a rejection notification
        INSERT INTO notifications (id, recipient_user_id, title, type, message, is_read, created_at, related_claim_id, related_item_id)
        SELECT
            gen_random_uuid()::text,
            NEW.claimant_id,
            'Claim Rejected',
            'CLAIM_REJECTED',
            '❌ [DB Trigger] Your claim has been REJECTED. Please contact admin for details.',
            false,
            NOW(),
            NEW.id,
            NEW.found_item_id;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Step 2: Attach the trigger to the claims table
-- Fires AFTER each row UPDATE on claims
DROP TRIGGER IF EXISTS trg_claim_status_change ON claims;

CREATE TRIGGER trg_claim_status_change
    AFTER UPDATE ON claims
    FOR EACH ROW
    EXECUTE FUNCTION fn_handle_claim_status_change();


-- =============================================================================
-- HOW TO APPLY:
--   psql -U postgres -d lostandfound -f database/trigger.sql
--
-- HOW TO VERIFY (test via psql):
--   UPDATE claims SET status = 'APPROVED' WHERE id = '<some_claim_id>';
--   SELECT status FROM found_items WHERE id = '<linked_found_item_id>';
--   -- Status should now be 'CLAIMED'
-- =============================================================================
