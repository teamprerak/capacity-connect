import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

  // BUG-01: Fail fast at startup — never ship with placeholder secrets
  if (!jwtSecret || jwtSecret === 'change-me-in-production') {
    throw new Error('FATAL: JWT_SECRET env var is missing or is set to the default placeholder. Set a strong random secret in Render environment variables.');
  }
  if (!jwtRefreshSecret || jwtRefreshSecret === 'refresh-change-me') {
    throw new Error('FATAL: JWT_REFRESH_SECRET env var is missing or is set to the default placeholder. Set a strong random secret in Render environment variables.');
  }

  return {
    jwtSecret,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    jwtRefreshSecret,
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  };
});
