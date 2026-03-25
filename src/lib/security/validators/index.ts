import 'server-only';
import { MAX_CODE_SIZE } from '../../constants';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  status?: number;
}

export function validateStringInput(
  value: unknown,
  fieldName: string,
  maxSize: number = MAX_CODE_SIZE
): ValidationResult {
  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a string`, status: 400 };
  }
  if (value.includes('\0')) {
    return { valid: false, error: 'Invalid characters in input', status: 400 };
  }
  if (new TextEncoder().encode(value).length > maxSize) {
    return { valid: false, error: `Input exceeds maximum size of ${Math.round(maxSize / 1024)}KB`, status: 413 };
  }
  return { valid: true };
}

export function validateEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fieldName: string
): ValidationResult {
  if (!allowed.includes(value as T)) {
    return { valid: false, error: `Invalid ${fieldName}`, status: 400 };
  }
  return { valid: true };
}
