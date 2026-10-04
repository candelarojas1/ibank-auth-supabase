import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar as RNStatusBar,
} from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Linking from 'expo-linking'
import { supabase } from '@/lib/supabase'
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/utils/validations'
import { getErrorMessage, isRateLimitError } from '@/utils/errors'
import { Colors, Spacing } from '@/constants/theme'

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

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

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    if (isLoading || cooldown > 0) return

    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const redirectTo = Linking.createURL('reset-password')

      const { error } = await supabase.auth.resetPasswordForEmail(data.email.trim(), {
        redirectTo,
      })

      if (error) {
        if (isRateLimitError(error)) {
          setCooldown(60)
          setErrorMessage(getErrorMessage(error))
          setIsLoading(false)
          return
        }
        setErrorMessage(getErrorMessage(error))
        setIsLoading(false)
        return
      }

      setSuccessMessage(
        'Si el email existe en nuestro sistema, vas a recibir instrucciones para restablecer tu contraseña.'
      )
      setCooldown(60)
    } catch (err: any) {
      setErrorMessage(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <RNStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header Figma */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(auth)/login'))}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Forgot password</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.formCard}>
            {/* Mensaje Neutro Anti-Enumeración */}
            {successMessage && (
              <View style={styles.successAlert}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#065F46" />
                <Text style={styles.successAlertText}>{successMessage}</Text>
              </View>
            )}

            {/* Mensaje de Error */}
            {errorMessage && (
              <View style={styles.errorAlert}>
                <Ionicons name="alert-circle-outline" size={20} color="#991B1B" />
                <Text style={styles.errorAlertText}>{errorMessage}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Type your email</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <>
                    <View style={[styles.inputContainer, error && styles.inputErrorBorder]}>
                      <TextInput
                        style={styles.input}
                        placeholder="tu@email.com"
                        placeholderTextColor={Colors.textMuted}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!isLoading}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    </View>
                    {error && <Text style={styles.fieldError}>{error.message}</Text>}
                  </>
                )}
              />
            </View>

            <Text style={styles.infoText}>
              We will send instructions to verify your email address.
            </Text>

            {/* Botón de Envío Figma (#3629B7) */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!isValid || isLoading || cooldown > 0) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || isLoading || cooldown > 0}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.submitButtonText}>Sending...</Text>
                </View>
              ) : cooldown > 0 ? (
                <Text style={styles.submitButtonText}>Retry in ({cooldown}s)</Text>
              ) : (
                <Text style={[styles.submitButtonText, !isValid && styles.submitButtonTextDisabled]}>
                  Send
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 52,
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: Colors.textDark,
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.borderRadiusCard,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F3F5',
    marginTop: 12,
  },
  successAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successBackground,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  successAlertText: {
    color: '#065F46',
    fontSize: 13,
    flex: 1,
    fontWeight: '500',
    lineHeight: 18,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 10,
  },
  errorAlertText: {
    color: '#991B1B',
    fontSize: 13,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadiusInput,
    paddingHorizontal: 18,
    height: 52,
  },
  inputErrorBorder: {
    borderColor: Colors.error,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textDark,
  },
  fieldError: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 24,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: Spacing.borderRadiusButton,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: Colors.disabledButton,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  submitButtonTextDisabled: {
    color: Colors.disabledText,
  },
})
