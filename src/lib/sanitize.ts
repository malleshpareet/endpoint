const SENSITIVE_KEYS = new Set([
  'password', 'client_secret', 'secret', 'api_key', 'apikey', 'access_token', 'refresh_token',
  'token', 'auth', 'authorization', 'bearer', 'x-api-key', 'stripe_secret', 'aws_access_key_id',
  'aws_secret_access_key', 'private_key', 'jwt', 'session', 'cookie', 'cvv', 'credit_card',
  'account_number', 'card_number', 'aadhaar', 'pan', 'passport', 'phone', 'email'
]);

const MASK_STRING = '********';

/**
 * Checks if a key name suggests it holds sensitive data.
 */
export function isSensitiveKey(key: string): boolean {
  if (typeof key !== 'string') return false;
  const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const sensitive of Array.from(SENSITIVE_KEYS)) {
    if (normalized.includes(sensitive)) {
      return true;
    }
  }
  return false;
}

/**
 * Redacts sensitive tokens from plain text or URLs.
 */
export function sanitizeString(text: string): string {
  if (typeof text !== 'string' || !text) return text;
  
  let sanitized = text;

  // Mask Bearer tokens (Bearer followed by base64/hex/jwt)
  sanitized = sanitized.replace(/Bearer\s+[A-Za-z0-9\-\._~\+\/]+=*/gi, `Bearer ${MASK_STRING}`);
  
  // Mask Basic auth (Basic followed by base64)
  sanitized = sanitized.replace(/Basic\s+[A-Za-z0-9\+\/]+=*/gi, `Basic ${MASK_STRING}`);
  
  // Mask basic auth in URLs (http://user:pass@domain.com)
  sanitized = sanitized.replace(/(https?:\/\/)([^:\/@]+):([^:\/@]+)@/gi, `$1$2:${MASK_STRING}@`);

  // Mask query params containing sensitive keys: ?api_key=SECRET&other=1
  const sensitiveQueryParams = ['api_key', 'apikey', 'token', 'access_token', 'secret', 'client_secret', 'password'];
  for (const qp of sensitiveQueryParams) {
    const regex = new RegExp(`([?&]${qp}=)([^&]+)`, 'gi');
    sanitized = sanitized.replace(regex, `$1${MASK_STRING}`);
  }
  
  // Mask emails
  sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, (match) => {
    const parts = match.split('@');
    if (parts.length === 2) {
      return `${parts[0].charAt(0)}***@${parts[1]}`;
    }
    return match;
  });

  // JWTs (basic regex for eyJ...)
  sanitized = sanitized.replace(/ey[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, `eyJ...${MASK_STRING}`);

  return sanitized;
}

/**
 * Recursively deep-clones and sanitizes an object or array.
 */
export function sanitizeObject(obj: any, maxDepth = 10, currentDepth = 0): any {
  // Prevent infinite recursion / max call stack issues
  if (currentDepth > maxDepth) return obj;

  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, maxDepth, currentDepth + 1));
  }

  const sanitizedObj: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (isSensitiveKey(key)) {
      sanitizedObj[key] = MASK_STRING;
    } else {
      sanitizedObj[key] = sanitizeObject(value, maxDepth, currentDepth + 1);
    }
  }
  return sanitizedObj;
}

/**
 * Sanitizes headers object (keys are case insensitive).
 */
export function sanitizeHeaders(headers: Record<string, string> | undefined | null): Record<string, string> {
  if (!headers) return {};
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (isSensitiveKey(key)) {
      if (typeof value === 'string') {
        if (value.toLowerCase().startsWith('bearer ')) {
          sanitized[key] = `Bearer ${MASK_STRING}`;
        } else if (value.toLowerCase().startsWith('basic ')) {
          sanitized[key] = `Basic ${MASK_STRING}`;
        } else {
          sanitized[key] = MASK_STRING;
        }
      } else {
        sanitized[key] = MASK_STRING;
      }
    } else {
      sanitized[key] = typeof value === 'string' ? sanitizeString(value) : value;
    }
  }
  return sanitized;
}

/**
 * Safely sanitizes arguments meant for console.log
 */
export function sanitizeConsoleArgs(args: any[]): any[] {
  return args.map(arg => sanitizeObject(arg));
}
