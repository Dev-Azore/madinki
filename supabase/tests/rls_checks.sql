-- ============================================================================
-- RLS Verification Suite - Tailor Measurement Management System
-- Execution: psql -f supabase/tests/rls_checks.sql
-- Note: Sprint 0 checks only Block 0 (Schema and Function Security). 
-- Full suite (Blocks 1+) will be runnable in Sprint 4 when test data exists.
-- ============================================================================

BEGIN;

-- ============================================================================
-- Block 0: Schema and Function Security Checks
-- ============================================================================

DO $$
DECLARE
  func_exists boolean;
  func_security_definer boolean;
  table_rls_enabled boolean;
BEGIN
  -- 1. Check if keep_alive table has RLS enabled (it must, with no policies)
  SELECT relrowsecurity INTO table_rls_enabled
  FROM pg_class
  WHERE relname = 'keep_alive';
  
  IF NOT table_rls_enabled THEN
    RAISE EXCEPTION 'RLS is not enabled on keep_alive table';
  END IF;

  -- 2. Check if measurements table has RLS enabled
  SELECT relrowsecurity INTO table_rls_enabled
  FROM pg_class
  WHERE relname = 'measurements';

  IF NOT table_rls_enabled THEN
    RAISE EXCEPTION 'RLS is not enabled on measurements table';
  END IF;

  -- 2b. Check if ledger_entries table has RLS enabled
  SELECT relrowsecurity INTO table_rls_enabled
  FROM pg_class
  WHERE relname = 'ledger_entries';

  IF table_rls_enabled IS NOT NULL AND NOT table_rls_enabled THEN
    RAISE EXCEPTION 'RLS is not enabled on ledger_entries table';
  END IF;

  -- 2c. Check if ledger_settings table has RLS enabled
  SELECT relrowsecurity INTO table_rls_enabled
  FROM pg_class
  WHERE relname = 'ledger_settings';

  IF table_rls_enabled IS NOT NULL AND NOT table_rls_enabled THEN
    RAISE EXCEPTION 'RLS is not enabled on ledger_settings table';
  END IF;

  -- 3. Check if is_admin() exists and is security definer
  SELECT 
    true, prosecdef INTO func_exists, func_security_definer
  FROM pg_proc
  WHERE proname = 'is_admin';

  IF NOT func_exists THEN
    RAISE EXCEPTION 'is_admin() function does not exist';
  END IF;
  
  IF NOT func_security_definer THEN
    RAISE EXCEPTION 'is_admin() must be SECURITY DEFINER';
  END IF;

  -- 4. Check if ping_keep_alive() exists and is security definer
  SELECT 
    true, prosecdef INTO func_exists, func_security_definer
  FROM pg_proc
  WHERE proname = 'ping_keep_alive';

  IF NOT func_exists THEN
    RAISE EXCEPTION 'ping_keep_alive() function does not exist';
  END IF;
  
  IF NOT func_security_definer THEN
    RAISE EXCEPTION 'ping_keep_alive() must be SECURITY DEFINER';
  END IF;

  RAISE NOTICE 'Block 0 (Schema & Function Security) passed successfully.';
END $$;

-- ============================================================================
-- Block 1+: Data-Dependent Checks (To be executed in Sprint 4+)
-- ============================================================================
-- TODO: Add tests for cross-tenant isolation, measurements immutability,
-- and admin access once test fixtures can be established.

ROLLBACK;
