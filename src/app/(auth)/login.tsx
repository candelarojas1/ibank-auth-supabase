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
import { Link, useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { loginSchema, LoginFormData } from '@/utils/validations'
import { getErrorMessage, isEmailNotConfirmedError, isRateLimitError } from '@/utils/errors'
import { Colors, Spacing } from '@/constants/theme'

export default function LoginScreen() {
  const router = useRouter()
  const { passwordUpdated } = useLocalSearchParams<{ passwordUpdated?: string }>()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  // Temporizador de 60s por Rate Limit (Sección 6.1)
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
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const isButtonEnabled = isValid && !isLoading && cooldown === 0

  const onSubmit = async (data: LoginFormData) => {
    if (isLoading || cooldown > 0) return

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email.trim(),
        password: data.password,
      })

      if (error) {
        if (isRateLimitError(error)) {
          setCooldown(60)
          setErrorMessage(getErrorMessage(error))
          setIsLoading(false)
          return
        }

        if (isEmailNotConfirmedError(error)) {
          router.push({
            pathname: '/(auth)/pending-confirmation',
            params: { email: data.email.trim() },
          })
          setIsLoading(false)
          return
        }

        setErrorMessage(getErrorMessage(error))
        setIsLoading(false)
        return
      }
    } catch (err: any) {
      setErrorMessage(getErrorMessage(err))
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.mainContainer}>
      <RNStatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Cabecera Púrpura Figma iBank */}
      <View style={styles.topHeader}>
        <SafeAreaView>
          <View style={styles.headerBar}>
            <TouchableOpacity
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/(auth)/login'))}
              style={styles.backBtn}
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sign in</Text>
            <View style={{ width: 24 }} />
          </View>
        </SafeAreaView>
      </View>

      {/* Tarjeta Curva Blanca Figma */}
      <View style={styles.curvedContent}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Títulos iBank */}
            <View style={styles.titleSection}>
              <Text style={styles.welcomeTitle}>Welcome Back</Text>
              <Text style={styles.welcomeSubtitle}>Hello there, sign in to continue</Text>
            </View>

            {/* Ilustración de candado con puntos multicolores del Figma */}
            <View style={styles.illustrationSection}>
              <View style={styles.badgeCircle}>
                <View style={[styles.dot, styles.dotYellow]} />
                <View style={[styles.dot, styles.dotRed]} />
                <View style={[styles.dot, styles.dotCyan]} />
                <View style={[styles.dot, styles.dotBlue]} />
                <Ionicons name="lock-closed" size={38} color={Colors.primary} />
              </View>
            </View>

            {/* Éxito tras cambiar la contraseña (Sección 6.5) */}
            {passwordUpdated && !errorMessage && (
              <View style={styles.successAlert}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#065F46" />
                <Text style={styles.successAlertText}>
                  Contraseña actualizada. Iniciá sesión con tu nueva contraseña.
                </Text>
              </View>
            )}

            {/* Alerta de Error */}
            {errorMessage && (
              <View style={styles.errorAlert}>
                <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
                <Text style={styles.errorAlertText}>{errorMessage}</Text>
              </View>
            )}

            {/* Campo Email */}
            <View style={styles.inputGroup}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <>
                    <View style={[styles.inputContainer, error && styles.inputErrorBorder]}>
                      <TextInput
                        style={styles.input}
                        placeholder="Text input (Email)"
                        placeholderTextColor={Colors.textMuted}
                        keyboardType="email-address"
                        autoCapitalize="none"
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

            {/* Campo Contraseña */}
            <View style={styles.inputGroup}>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <>
                    <View style={[styles.inputContainer, error && styles.inputErrorBorder]}>
                      <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor={Colors.textMuted}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="current-password"
                        editable={!isLoading}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                        style={styles.eyeBtn}
                      >
                        <Ionicons
                          name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                          size={20}
                          color={Colors.textMuted}
                        />
                      </TouchableOpacity>
                    </View>
                    {error && <Text style={styles.fieldError}>{error.message}</Text>}
                  </>
                )}
              />

              {/* Link Olvidaste tu contraseña */}
              <View style={styles.forgotRow}>
                <Link href="/(auth)/forgot-password" style={styles.forgotLink}>
                  Forgot your password ?
                </Link>
              </View>
            </View>

            {/* Botón Iniciar Sesión (Estilo Figma) */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                !isButtonEnabled && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={!isButtonEnabled}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.submitButtonText}>Sign in...</Text>
                </View>
              ) : cooldown > 0 ? (
                <Text style={styles.submitButtonText}>Reintentar en ({cooldown}s)</Text>
              ) : (
                <Text
                  style={[
                    styles.submitButtonText,
                    !isButtonEnabled && styles.submitButtonTextDisabled,
                  ]}
                >
                  Sign in
                </Text>
              )}
            </TouchableOpacity>

            {/* Footer con link a Registro */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don&apos;t have an account? </Text>
              <Link href="/(auth)/register" style={styles.registerLink}>
                Sign Up
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
    paddingBottom: 24,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  curvedContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 28,
    flexGrow: 1,
  },
  titleSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  illustrationSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  badgeCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    borderRadius: 10,
  },
  dotYellow: {
    width: 14,
    height: 14,
    backgroundColor: '#FBC02D',
    left: -6,
    bottom: 12,
  },
  dotRed: {
    width: 16,
    height: 16,
    backgroundColor: '#FF4D4D',
    right: -8,
    top: 18,
  },
  dotCyan: {
    width: 10,
    height: 10,
    backgroundColor: '#00E5FF',
    left: 4,
    top: 10,
  },
  dotBlue: {
    width: 10,
    height: 10,
    backgroundColor: '#2979FF',
    right: 6,
    bottom: 8,
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
  successAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 10,
  },
  successAlertText: {
    color: '#065F46',
    fontSize: 13,
    flex: 1,
  },
  errorAlertText: {
    color: '#991B1B',
    fontSize: 13,
    flex: 1,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadiusInput,
    paddingHorizontal: 18,
    height: 54,
  },
  inputErrorBorder: {
    borderColor: Colors.error,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textDark,
  },
  eyeBtn: {
    padding: 4,
  },
  fieldError: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginTop: 10,
  },
  forgotLink: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: Spacing.borderRadiusButton,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
    marginBottom: 16,
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  registerLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
})
