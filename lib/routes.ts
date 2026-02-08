export const ROUTES = {
  HOME: '/focus',
  FOCUS: '/focus',
  SESSIONS: '/sessions',
  LOGIN: '/login',
  REGISTER: '/register',
  SETTINGS: '/settings',
} as const

export const AUTH_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER] as const
export const PROTECTED_ROUTES = [ROUTES.SETTINGS] as const
