import React, { useEffect } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { Slot, useRouter, useSegments } from 'expo-router'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { StatusBar } from 'expo-status-bar'

// Componente guardián de rutas protegidas (Sección 7.2)
function InitialLayout() {
  const { session, isLoading, isPasswordRecovery } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    const inAuthGroup = segments[0] === '(auth)'

    if (isPasswordRecovery) {
      // Si proviene de un deep link de recuperación de clave (Sección 6.5)
      router.replace('/(auth)/reset-password')
    } else if (session && inAuthGroup) {
      // Con sesión válida, redirigir a Home (las pantallas de auth quedan inaccesibles)
      router.replace('/(app)')
    } else if (!session && !inAuthGroup) {
      // Sin sesión válida, redirigir a Login
      router.replace('/(auth)/login')
    }
  }, [session, isLoading, isPasswordRecovery, segments, router])

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0F4C81" />
      </View>
    )
  }

  return <Slot />
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <InitialLayout />
    </AuthProvider>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFC',
  },
})
