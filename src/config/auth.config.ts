// Configurações de autenticação
export const AUTH_CONFIG = {
  // Token JWT expira em 24 horas
  JWT_EXPIRES_IN: '24h',
  JWT_EXPIRES_IN_SECONDS: 24 * 60 * 60,

  // Configurações de segurança
  BCRYPT_ROUNDS: 12,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutos em milliseconds

  // Rate limiting
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutos
  RATE_LIMIT_MAX_REQUESTS: 5, // máximo 5 tentativas por janela

  // Cookies
  COOKIE_NAME: 'auth-token',
  COOKIE_MAX_AGE: 24 * 60 * 60 * 1000, // 24 horas em milliseconds
} as const;

// Validar se temos as variáveis de ambiente necessárias
export function validateAuthConfig() {
  const requiredEnvVars = ['JWT_SECRET'];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(
        `Variável de ambiente obrigatória não encontrada: ${envVar}`
      );
    }
  }
}

// Obter JWT secret com fallback para desenvolvimento
export function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '⚠️ JWT_SECRET não definido. Usando secret padrão para desenvolvimento.'
      );
      return 'development-secret-key-do-not-use-in-production';
    }
    throw new Error('JWT_SECRET é obrigatório em produção');
  }

  return secret;
}
