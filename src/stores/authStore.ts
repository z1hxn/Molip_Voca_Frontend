import { create } from 'zustand'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { supabase } from '@/shared/api/supabaseClient'
import { apiRequest } from '@/shared/api/http'
import type { User } from '@/shared/types'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  initialize: () => Promise<void>
  updateProfile: (data: { username: string; profile_image?: string | null }) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, username: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

let initialized = false

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,

  initialize: async () => {
    if (initialized) {
      set({ loading: false })
      return
    }
    initialized = true

    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      try {
        const profile = await apiRequest<User>('/auth/me', { auth: 'required' })
        set({ user: profile, session, loading: false })
      } catch {
        set({ user: null, session: null, loading: false })
      }
    } else {
      set({ loading: false })
    }

    supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      if (session?.user) {
        try {
          const profile = await apiRequest<User>('/auth/me', { auth: 'required' })
          set({ user: profile, session })
        } catch {
          set({ user: null, session: null })
        }
      } else {
        set({ user: null, session: null })
      }
    })
  },

  signUp: async (email, password, username) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    if (error) {
      const message = error.message.toLowerCase().includes('email rate limit exceeded')
        ? '이메일 발송 제한에 걸렸습니다. Supabase Dashboard > Authentication > Rate Limits에서 설정을 조정하거나 잠시 후 다시 시도해주세요.'
        : error.message
      return { error: message }
    }
    return { error: null }
  },

  updateProfile: async (data) => {
    try {
      const payload = {
        username: data.username,
        profile_image: data.profile_image ?? null,
      }
      const profile = await apiRequest<User>('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
      set({ user: profile })
      return { error: null }
    } catch (error) {
      return { error: error instanceof Error ? error.message : '프로필 저장에 실패했습니다.' }
    }
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { error: null }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },
}))
