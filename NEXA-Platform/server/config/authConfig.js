/**
 * 인증 설정 [NEXA-AUTH-01] §12.1 결정값
 * JWT access 1시간, refresh 7일
 */
export const authConfig = {
  jwtAccessSecret: process.env.JWT_SECRET || 'change-me-in-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'change-me-in-production',
  accessExpirySec: parseInt(process.env.JWT_ACCESS_EXPIRY || '3600', 10),   // 1h
  refreshExpirySec: parseInt(process.env.JWT_REFRESH_EXPIRY || '604800', 10), // 7d
  defaultTier: 'BASIC',
}
