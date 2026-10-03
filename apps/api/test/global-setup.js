/**
 * H-7 FIX: Jest globalSetup for E2E tests.
 *
 * Sets required environment variables BEFORE any test module (including auth.config.ts)
 * is loaded. Without these, auth.config.ts throws "FATAL: JWT_SECRET env var is missing"
 * and ALL 33 E2E tests fail before they can even start.
 *
 * In CI/CD, override these with real secrets via environment variables on the runner.
 */
module.exports = async function () {
  process.env.DATABASE_URL =
    process.env.DATABASE_URL ||
    'postgresql://ccuser:ccpassword@localhost:5433/capacityconnect';

  process.env.JWT_SECRET =
    process.env.JWT_SECRET ||
    'e2e-test-jwt-secret-minimum-64-chars-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

  process.env.JWT_REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET ||
    'e2e-test-refresh-secret-minimum-64-chars-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

  process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
  process.env.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  process.env.API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';
  process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

  // Ensure NODE_ENV is set so DEMO_MASTER_KEY backdoor is explicitly disabled
  process.env.NODE_ENV = process.env.NODE_ENV || 'test';
};
