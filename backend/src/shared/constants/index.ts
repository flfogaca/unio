// Application constants

export const SPECIALTIES = {
  PSYCHOLOGIST: 'psicologo',
  DENTIST: 'dentista',
  MEDICAL_CLINIC: 'medico-clinico',
} as const;

export const USER_ROLES = {
  PATIENT: 'paciente',
  DENTIST: 'dentista',
  PSYCHOLOGIST: 'psicologo',
  MEDICAL_DOCTOR: 'medico',
  ADMIN: 'admin',
} as const;

export const CONSULTATION_STATUS = {
  IN_QUEUE: 'em-fila',
  IN_PROGRESS: 'em-atendimento',
  FINISHED: 'finalizado',
  CANCELLED: 'cancelado',
} as const;

export const CONSULTATION_PRIORITY = {
  LOW: 'baixa',
  MEDIUM: 'media',
  HIGH: 'alta',
  URGENT: 'urgente',
} as const;

export const JWT_CONSTANTS = {
  ACCESS_TOKEN_EXPIRES_IN: '15m',
  REFRESH_TOKEN_EXPIRES_IN: '7d',
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const FILE_UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const;

export const RATE_LIMITS = {
  LOGIN_ATTEMPTS: 5,
  LOGIN_WINDOW: 15 * 60 * 1000, // 15 minutes
  API_REQUESTS_PER_MINUTE: 100,
  API_WINDOW: 60 * 1000, // 1 minute
} as const;

export const VIDEO_CALL_CONSTANTS = {
  ROOM_EXPIRATION: 2 * 60 * 60 * 1000, // 2 hours
  MAX_PARTICIPANTS: 2,
  HEARTBEAT_INTERVAL: 30 * 1000, // 30 seconds
} as const;

export const MEDICAL_RECORD_CONSTANTS = {
  MAX_NOTES_LENGTH: 5000,
  REQUIRED_FIELDS: ['diagnosis', 'treatment', 'notes'],
} as const;
