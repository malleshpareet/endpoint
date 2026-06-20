/**
 * Data Masking Feature - DISABLED based on user feedback to allow proper API testing.
 * The functions remain exported to satisfy imports across the application.
 */

export function isSensitiveKey(key: string): boolean {
  return false;
}

export function sanitizeString(text: string): string {
  return text;
}

export function sanitizeObject(obj: any, maxDepth = 10, currentDepth = 0): any {
  return obj;
}

export function sanitizeHeaders(headers: Record<string, string> | undefined | null): Record<string, string> {
  return headers || {};
}

export function sanitizeConsoleArgs(args: any[]): any[] {
  return args;
}
