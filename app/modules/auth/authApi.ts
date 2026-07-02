interface RegisterDto {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

interface LoginDto {
  email: string
  password: string
}

interface AuthResponse {
  accessToken: string
}

export const authApi = {
  register(dto: RegisterDto) {
    const { $api } = useNuxtApp()
    return $api<AuthResponse>('/auth/register', {
      method: 'POST',
      body: dto,
    })
  },

  login(dto: LoginDto) {
    const { $api } = useNuxtApp()
    return $api<AuthResponse>('/auth/login', {
      method: 'POST',
      body: dto,
    })
  },

  refresh() {
    const config = useRuntimeConfig()
    return $fetch<AuthResponse>('/auth/refresh', {
      baseURL: config.public.apiBase,
      method: 'POST',
      credentials: 'include',
    })
  },

  logout() {
    const { $api } = useNuxtApp()
    return $api('/auth/logout', {
      method: 'POST',
    })
  },

  forgotPassword(email: string) {
    const { $api } = useNuxtApp()
    return $api('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    })
  },

  resetPassword(token: string, newPassword: string) {
    const { $api } = useNuxtApp()
    return $api('/auth/reset-password', {
      method: 'POST',
      body: { token, newPassword },
    })
  },

  googleCallback(code: string) {
    const { $api } = useNuxtApp()
    return $api<AuthResponse>('/auth/google/callback', {
      method: 'POST',
      body: { code },
    })
  },
}
