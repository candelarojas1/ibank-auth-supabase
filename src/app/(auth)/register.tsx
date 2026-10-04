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
import { useForm, useWatch, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Linking from 'expo-linking'
import { supabase } from '@/lib/supabase'
import { registerSchema, RegisterFormData, checkPasswordRules } from '@/utils/validations'
import { getErrorMessage, isRateLimitError, isUserAlreadyExistsError } from '@/utils/errors'
import { Colors, Spacing } from '@/constants/theme'

export default function RegisterScreen() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  // Cooldown de 60s ante rate limit en el envío de emails (Sección 6.3 / 8)
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  })

  const passwordValue = useWatch({ control, name: 'password' }) || ''
  const passwordRulesState = checkPasswordRules(passwordValue)

  const onSubmit = async (data: RegisterFormData) => {
    if (isLoading || cooldown > 0) return

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const emailRedirectTo = Linking.createURL('confirm')

      const { error } = await supabase.auth.signUp({
        email: data.email.trim(),
        password: data.password,
        options: {
          data: {
            full_name: data.fullName.trim(),
          },
          emailRedirectTo,
        },
      })

      // Anti-enumeración: un email ya registrado sigue el mismo camino que un alta nueva
      if (error && !isUserAlreadyExistsError(error)) {
        if (isRateLimitError(error)) setCooldown(60)
        setErrorMessage(getErrorMessage(error))
        setIsLoading(false)
        return
      }

      setIsLoading(false)
      router.push({
        pathname: '/(auth)/pending-confirmation',
        params: { email: data.email.trim() },
      })
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
            <Text style={styles.headerTitle}>Sign up</Text>
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
            {/* Títulos Figma */}
            <View style={styles.titleSection}>
              <Text style={styles.welcomeTitle}>Welcome to us,</Text>
              <Text style={styles.welcomeSubtitle}>Hello there, create New account</Text>
            </View>

            {/* Ilustración de Celular / Usuario con puntos de colores del Figma */}
            <View style={styles.illustrationSection}>
              <View style={styles.badgeCircle}>
                <View style={[styles.dot, styles.dotYellow]} />
                <View style={[styles.dot, styles.dotRed]} />
                <View style={[styles.dot, styles.dotCyan]} />
                <View style={[styles.dot, styles.dotBlue]} />
                <Ionicons name="person-add-outline" size={38} color={Colors.primary} />
              </View>
            </View>

            {/* Alerta de Error */}
            {errorMessage && (
              <View style={styles.errorAlert}>
                <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
                <Text style={styles.errorAlertText}>{errorMessage}</Text>
              </View>
            )}

            {/* Campo Nombre */}
            <View style={styles.inputGroup}>
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <>
                    <View style={[styles.inputContainer, error && styles.inputErrorBorder]}>
                      <TextInput
                        style={styles.input}
                        placeholder="Name"
                        placeholderTextColor={Colors.textMuted}
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

              {/* Checklist Visual de Requisitos (Sección 6.2) */}
              <View style={styles.checklistContainer}>
                <Text style={styles.checklistTitle}>Requisitos de contraseña:</Text>
                <RuleItem isValid={passwordRulesState.minLength} text="Mínimo 8 caracteres" />
                <RuleItem isValid={passwordRulesState.hasUppercase} text="Al menos una mayúscula (A-Z)" />
                <RuleItem isValid={passwordRulesState.hasLowercase} text="Al menos una minúscula (a-z)" />
                <RuleItem isValid={passwordRulesState.hasNumber} text="Al menos un número (0-9)" />
                <RuleItem isValid={passwordRulesState.hasSymbol} text="Al menos un símbolo (!@#$%^&*)" />
              </View>
            </View>

            {/* Campo Confirmar Contraseña */}
            <View style={styles.inputGroup}>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <>
                    <View style={[styles.inputContainer, error && styles.inputErrorBorder]}>
                      <TextInput
                        style={styles.input}
                        placeholder="Confirm password"
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

            {/* Checkbox Términos y Condiciones (Estilo Figma) */}
            <View style={styles.inputGroup}>
              <Controller
                control={control}
                name="acceptTerms"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <>
                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() => onChange(!value)}
                      disabled={isLoading}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.checkbox, value && styles.checkboxChecked]}>
                        {value && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                      </View>
                      <Text style={styles.checkboxLabel}>
                        By creating an account your agree to our{' '}
                        <Text style={styles.termsBold}>Term and Condtions</Text>
                      </Text>
                    </TouchableOpacity>
                    {error && <Text style={styles.fieldError}>{error.message}</Text>}
                  </>
                )}
              />
            </View>

            {/* Botón Registra (Sign up) */}
            <TouchableOpacity
              style={[styles.submitButton, (!isValid || isLoading || cooldown > 0) && styles.submitButtonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || isLoading || cooldown > 0}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.submitButtonText}>Creating account...</Text>
                </View>
              ) : cooldown > 0 ? (
                <Text style={styles.submitButtonText}>Reintentar en ({cooldown}s)</Text>
              ) : (
                <Text style={[styles.submitButtonText, !isValid && styles.submitButtonTextDisabled]}>
                  Sign up
                </Text>
              )}
            </TouchableOpacity>

            {/* Footer con link a Sign in */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Have an account? </Text>
              <Link href="/(auth)/login" style={styles.loginLink}>
                Sign In
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
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
    marginBottom: 16,
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
    marginBottom: 24,
  },
  badgeCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
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
    width: 12,
    height: 12,
    backgroundColor: '#FBC02D',
    left: -4,
    bottom: 10,
  },
  dotRed: {
    width: 14,
    height: 14,
    backgroundColor: '#FF4D4D',
    right: -6,
    top: 14,
  },
  dotCyan: {
    width: 10,
    height: 10,
    backgroundColor: '#00E5FF',
    left: 4,
    top: 8,
  },
  dotBlue: {
    width: 10,
    height: 10,
    backgroundColor: '#2979FF',
    right: 4,
    bottom: 6,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  errorAlertText: {
    color: '#991B1B',
    fontSize: 13,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
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
    marginTop: 4,
    marginLeft: 4,
  },
  checklistContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    flex: 1,
    lineHeight: 18,
  },
  termsBold: {
    color: Colors.primary,
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: Spacing.borderRadiusButton,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
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
    marginTop: 24,
    marginBottom: 16,
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  loginLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
})
