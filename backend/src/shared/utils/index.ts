import { v4 as uuidv4 } from 'uuid';
import { PAGINATION_DEFAULTS } from '../constants';

// UUID generation
export const generateUUID = (): string => uuidv4();

// Pagination utilities
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const normalizePaginationParams = (params: PaginationParams) => {
  const page = Math.max(1, params.page || PAGINATION_DEFAULTS.PAGE);
  const limit = Math.min(
    Math.max(1, params.limit || PAGINATION_DEFAULTS.LIMIT),
    PAGINATION_DEFAULTS.MAX_LIMIT,
  );
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
    sortBy: params.sortBy || 'createdAt',
    sortOrder: params.sortOrder || 'desc',
  };
};

// Date utilities
export const formatDate = (date: Date): string => {
  return date.toISOString();
};

export const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60 * 1000);
};

export const addHours = (date: Date, hours: number): Date => {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
};

export const isExpired = (date: Date): boolean => {
  return date.getTime() < Date.now();
};

// String utilities
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const maskCPF = (cpf: string): string => {
  if (!cpf || cpf.length !== 11) return cpf;
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const unmaskCPF = (cpf: string): string => {
  return cpf.replace(/\D/g, '');
};

// Validation utilities
export const isValidCPF = (cpf: string): boolean => {
  const cleanCPF = unmaskCPF(cpf);
  
  if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cleanCPF.charAt(10));
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Object utilities
export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

// Error utilities
export const createErrorResponse = (message: string, statusCode: number = 400) => {
  return {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    statusCode,
  };
};

export const createSuccessResponse = <T>(data: T, message?: string) => {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
};
