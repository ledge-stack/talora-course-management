/**
 * OpenAPI contracts and schema metadata export for Talora API (/api/v1)
 */

export const API_BASE_PATH = '/api/v1';

export interface ApiErrorResponse {
  code: string;
  message: string;
  field_errors?: Record<string, string[]>;
  request_id?: string;
}

export const ENDPOINTS = {
  AUTH_LOGIN: '/auth/login',
  ME: '/me',
  GROUPS: (offeringId: string) => `/offerings/${offeringId}/groups`,
  INVITATIONS: (groupId: string) => `/groups/${groupId}/invitations`,
  GROUP_CHANGE_REQUESTS: '/group-change-requests',
  ANNOUNCEMENTS: '/announcements',
  ASSIGNMENTS: '/assignments',
  SUBMISSIONS: '/submissions',
  ISSUES: '/issues',
  IMPORTS: '/imports',
  EXPORTS: '/exports',
  NOTIFICATIONS: '/notifications',
} as const;
