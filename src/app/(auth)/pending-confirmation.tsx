import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StatusBar as RNStatusBar,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { getErrorMessage, isRateLimitError } from '@/utils/errors'
import { Colors, Spacing } from '@/constants/theme'

export default function PendingConfirmationScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ email?: string }>()
  const email = params.email || 'tu email registrado'

  const [isLoading, setIsLoading] = useState(false)
  const [cooldown, setCooldown] = useState(60)
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [cooldown])

  const handleResend = async () => {
    if (isLoading || cooldown > 0 || !params.email) return

    setIsLoading(true)
    setMessage(null)
    setErrorMessage(null)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: params.email,
      })

      if (error) {
        if (isRateLimitError(error)) setCooldown(60)
        setErrorMessage(getErrorMessage(error))
      } else {
        setMessage('Se ha reenviado el correo de confirmación. Revisá tu bandeja.')
        setCooldown(60)
      }
    } catch (err: any) {
      setErrorMessage(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <RNStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail-unread" size={46} color={Colors.primary} />
          </View>

          <Text style={styles.title}>¡Revisá tu email!</Text>
          <Text style={styles.subtitle}>Enviamos un enlace de confirmación a:</Text>

          <View style={styles.emailBadge}>
            <Ionicons name="mail" size={16} color={Colors.primary} />
            <Text style={styles.emailText}>{email}</Text>
          </View>

          <Text style={styles.instructionText}>
            Hacé clic en el enlace del correo para activar tu cuenta. Una vez confirmado, la aplicación te llevará automáticamente a tu cuenta.
          </Text>

          {message && (
            <View style={styles.successAlert}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#065F46" />
              <Text style={styles.successAlertText}>{message}</Text>
            </View>
          )}

          {errorMessage && (
            <View style={styles.errorAlert}>
              <Ionicons name="alert-circle-outline" size={18} color="#991B1B" />
              <Text style={styles.errorAlertText}>{errorMessage}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.resendButton,
              (cooldown > 0 || isLoading) && styles.resendButtonDisabled,
            ]}
            onPress={handleResend}
            disabled={cooldown > 0 || isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : cooldown > 0 ? (
              <Text style={styles.resendButtonText}>Reenviar correo en ({cooldown}s)</Text>
            ) : (
              <Text style={styles.resendButtonText}>Reenviar correo de confirmación</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text style={styles.backButtonText}>Volver a Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.borderRadiusCard,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  iconContainer: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  emailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginVertical: 16,
  },
  emailText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  instructionText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  successAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
    width: '100%',
  },
  successAlertText: {
    color: '#065F46',
    fontSize: 13,
    flex: 1,
    fontWeight: '500',
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
    width: '100%',
  },
  errorAlertText: {
    color: '#991B1B',
    fontSize: 13,
    flex: 1,
    fontWeight: '500',
  },
  resendButton: {
    backgroundColor: Colors.primary,
    width: '100%',
    height: 52,
    borderRadius: Spacing.borderRadiusButton,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendButtonDisabled: {
    backgroundColor: Colors.disabledButton,
  },
  resendButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 10,
  },
  backButtonText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
})
