import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import * as Linking from 'expo-linking'
import { getErrorMessage } from '@/utils/errors'

type AuthContextType = {
  session: Session | null
  user: User | null
  isLoading: boolean
  isPasswordRecovery: boolean
  isProcessingLink: boolean
  linkError: string | null
  signOut: () => Promise<void>
  clearPasswordRecovery: () => void
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  isPasswordRecovery: false,
  isProcessingLink: false,
  linkError: null,
  signOut: async () => {},
  clearPasswordRecovery: () => {},
})

// Junta los parámetros del query (?code=...) y del fragmento (#error=...) del deep link
function getUrlParams(url: string): Record<string, string> {
  const params: Record<string, string> = {}
  const [withoutHash, hash = ''] = url.split('#')
  const query = withoutHash.split('?')[1] ?? ''
  for (const part of [query, hash]) {
    new URLSearchParams(part).forEach((value, key) => {
      params[key] = value
    })
  }
  return params
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)
  const [isProcessingLink, setIsProcessingLink] = useState(false)
  const [linkError, setLinkError] = useState<string | null>(null)
  const handledUrls = useRef(new Set<string>())

  useEffect(() => {
    // Deep links de confirmación de email y reset de contraseña (Secciones 6.3 y 6.5)
    const handleAuthUrl = async (url: string | null) => {
      if (!url || handledUrls.current.has(url)) return
      const params = getUrlParams(url)
      const isAuthLink = params.code || params.error || params.error_code || params.access_token
      if (!isAuthLink) return

      handledUrls.current.add(url)
      setIsProcessingLink(true)
      setLinkError(null)

      try {
        if (params.error || params.error_code) {
          // Link vencido o inválido: no se crea sesión
          setLinkError(getErrorMessage({ code: params.error_code, message: params.error_description }))
        } else if (params.code) {
          // Emite SIGNED_IN o PASSWORD_RECOVERY según el tipo de link
          const { error } = await supabase.auth.exchangeCodeForSession(params.code)
          if (error) setLinkError(getErrorMessage(error))
        } else if (params.access_token && params.refresh_token) {
          // Compatibilidad con links del flujo implícito
          const { error } = await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token,
          })
          if (error) setLinkError(getErrorMessage(error))
          else if (params.type === 'recovery') setIsPasswordRecovery(true)
        }
      } catch (err) {
        setLinkError(getErrorMessage(err))
      } finally {
        setIsProcessingLink(false)
      }
    }

    // 1. Escuchar cambios en el estado de autenticación (Sección 6.5)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true)
      }
    })

    // 2. Resolver la sesión inicial (y el link con el que se abrió la app) antes de mostrar pantallas
    const init = async () => {
      await handleAuthUrl(await Linking.getInitialURL())
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    }
    init()

    // 3. Links recibidos con la app ya abierta
    const linkSubscription = Linking.addEventListener('url', ({ url }) => {
      handleAuthUrl(url)
    })

    return () => {
      subscription.unsubscribe()
      linkSubscription.remove()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
    setIsPasswordRecovery(false)
  }

  const clearPasswordRecovery = () => {
    setIsPasswordRecovery(false)
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        isPasswordRecovery,
        isProcessingLink,
        linkError,
        signOut,
        clearPasswordRecovery,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
