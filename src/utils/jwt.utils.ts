import jwt from 'jsonwebtoken';
import { JWTPayload } from '@/types/auth.types';
import { AUTH_CONFIG, getJWTSecret } from '@/config/auth.config';

/**
 * Gera um token JWT para o usuário
 */
export function generateToken(
  payload: Omit<JWTPayload, 'iat' | 'exp'>
): string {
  const secret = getJWTSecret();

  return jwt.sign(payload, secret, {
    expiresIn: AUTH_CONFIG.JWT_EXPIRES_IN,
  });
}

/**
 * Verifica e decodifica um token JWT
 */
export function verifyToken(token: string): JWTPayload {
  const secret = getJWTSecret();

  try {
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expirado');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Token inválido');
    }
    throw new Error('Erro ao verificar token');
  }
}

/**
 * Extrai token do header Authorization
 */
export function extractTokenFromHeader(authorization?: string): string | null {
  if (!authorization) return null;

  // Formato esperado: "Bearer <token>"
  const parts = authorization.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Verifica se um token está próximo do vencimento (menos de 1 hora)
 */
export function isTokenNearExpiration(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    if (!decoded?.exp) return false;

    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiration = decoded.exp - now;

    // Retorna true se expira em menos de 1 hora (3600 segundos)
    return timeUntilExpiration < 3600;
  } catch {
    return true; // Se não conseguir decodificar, considera como próximo do vencimento
  }
}
