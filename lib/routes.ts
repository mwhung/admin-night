export const ROUTES = {
  HOME: '/focus',
  FOCUS: '/focus',
  SESSIONS: '/sessions',
  LOGIN: '/login',
  REGISTER: '/register',
  SETTINGS: '/settings',
  SETTINGS_ACCOUNT: '/settings/account',
} as const

export const AUTH_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER] as const
export const PROTECTED_ROUTES = [ROUTES.SETTINGS] as const
