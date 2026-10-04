import React, { useState } from 'react'
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
import { useForm, useWatch, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { resetPasswordSchema, ResetPasswordFormData, checkPasswordRules } from '@/utils/validations'
import { getErrorMessage } from '@/utils/errors'
import { useAuth } from '@/context/AuthContext'
import { Colors, Spacing } from '@/constants/theme'

export default function ResetPasswordScreen() {
  const router = useRouter()
  const { session, isPasswordRecovery, isProcessingLink, signOut } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const passwordValue = useWatch({ control, name: 'password' }) || ''
  const passwordRulesState = checkPasswordRules(passwordValue)

  const isLinkInvalid = !session || !isPasswordRecovery

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (isLoading || isLinkInvalid) return

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (error) {
        setErrorMessage(getErrorMessage(error))
        setIsLoading(false)
        return
      }

      // Cerrar la sesión temporal de recuperación de inmediato (Sección 6.5)
      await signOut()
      setIsSuccess(true)
      setIsLoading(false)
    } catch (err: any) {
      setErrorMessage(getErrorMessage(err))
      setIsLoading(false)
    }
  }

  const handleFinishSuccess = () => {
    router.replace({ pathname: '/(auth)/login', params: { passwordUpdated: '1' } })
  }

  // Vista de éxito del Figma (Change password #2)
  if (isSuccess) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <RNStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.successContainer}>
          <View style={styles.badgeCircleSuccess}>
            <Ionicons name="shield-checkmark" size={60} color={Colors.primary} />
          </View>

          <Text style={styles.successTitle}>Change password successfully!</Text>
          <Text style={styles.successBody}>
            You have successfully changed password. Please use the new password when Sign in.
          </Text>

          <TouchableOpacity style={styles.submitButton} onPress={handleFinishSuccess} activeOpacity={0.8}>
            <Text style={styles.submitButtonText}>Ok</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // Esperando que se procese el deep link del email
  if (isProcessingLink) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.invalidContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    )
  }

  // Estado de Link Inválido / Expirado
  if (isLinkInvalid) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <RNStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.invalidContainer}>
          <View style={styles.invalidCard}>
            <View style={styles.iconCircleError}>
              <Ionicons name="time-outline" size={44} color="#DC2626" />
            </View>
            <Text style={styles.invalidTitle}>Enlace expirado o inválido</Text>
            <Text style={styles.invalidSubtitle}>
              El enlace para restablecer tu contraseña venció o no es válido. Por razones de seguridad, debes solicitar uno nuevo.
            </Text>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => router.replace('/(auth)/forgot-password')}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>Solicitar nuevo enlace</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.backButtonText}>Volver a Iniciar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <RNStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header Figma: Change password */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change password</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.formCard}>
            {errorMessage && (
              <View style={styles.errorAlert}>
                <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
                <Text style={styles.errorAlertText}>{errorMessage}</Text>
              </View>
            )}

            {/* Type your new password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Type your new password</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <>
                    <View style={[styles.inputContainer, error && styles.inputErrorBorder]}>
                      <TextInput
                        style={styles.input}
                        placeholder="••••••••••••"
                        placeholderTextColor={Colors.textMuted}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="new-password"
                        editable={!isLoading}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={isLoading}>
                        <Ionicons
                          name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                          size={20}
                          color={Colors.textMuted}
                        />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              />

              {/* Checklist Visual de Requisitos */}
              <View style={styles.checklistContainer}>
                <Text style={styles.checklistTitle}>Requisitos de contraseña:</Text>
                <RuleItem isValid={passwordRulesState.minLength} text="Mínimo 8 caracteres" />
                <RuleItem isValid={passwordRulesState.hasUppercase} text="Al menos una mayúscula (A-Z)" />
                <RuleItem isValid={passwordRulesState.hasLowercase} text="Al menos una minúscula (a-z)" />
                <RuleItem isValid={passwordRulesState.hasNumber} text="Al menos un número (0-9)" />
                <RuleItem isValid={passwordRulesState.hasSymbol} text="Al menos un símbolo (!@#$%^&*)" />
              </View>
            </View>

            {/* Confirm password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm password</Text>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <>
                    <View style={[styles.inputContainer, error && styles.inputErrorBorder]}>
                      <TextInput
                        style={styles.input}
                        placeholder="••••••••••••"
                        placeholderTextColor={Colors.textMuted}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="new-password"
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

            {/* Botón Change password */}
            <TouchableOpacity
              style={[styles.submitButton, (!isValid || isLoading) && styles.submitButtonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.submitButtonText}>Changing password...</Text>
                </View>
              ) : (
                <Text style={[styles.submitButtonText, !isValid && styles.submitButtonTextDisabled]}>
                  Change password
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function RuleItem({ isValid, text }: { isValid: boolean; text: string }) {
  return (
    <View style={styles.ruleRow}>
      <Ionicons
        name={isValid ? 'checkmark-circle' : 'ellipse-outline'}
        size={15}
        color={isValid ? '#10B981' : Colors.textMuted}
      />
      <Text style={[styles.ruleText, isValid && styles.ruleTextValid]}>{text}</Text>
    </View>
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
    marginBottom: 16,
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
  checklistContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  checklistTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 6,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  ruleText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  ruleTextValid: {
    color: '#059669',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: Spacing.borderRadiusButton,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
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
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
  },
  badgeCircleSuccess: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  successBody: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  invalidContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  invalidCard: {
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
  iconCircleError: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.errorBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  invalidTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  invalidSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
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
