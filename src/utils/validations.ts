import { z } from 'zod'

/**
 * Utilidades para verificación visual de reglas de contraseña en tiempo real.
 * Requerimiento Sección 6.2 (Checklist visual).
 */
export const PASSWORD_RULES = {
  minLength: (val: string) => val.length >= 8,
  hasUppercase: (val: string) => /[A-Z]/.test(val),
  hasLowercase: (val: string) => /[a-z]/.test(val),
  hasNumber: (val: string) => /[0-9]/.test(val),
  hasSymbol: (val: string) => /[^A-Za-z0-9]/.test(val),
}

export type PasswordChecklistState = {
  minLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
  hasSymbol: boolean
}

export function checkPasswordRules(password: string): PasswordChecklistState {
  return {
    minLength: PASSWORD_RULES.minLength(password),
    hasUppercase: PASSWORD_RULES.hasUppercase(password),
    hasLowercase: PASSWORD_RULES.hasLowercase(password),
    hasNumber: PASSWORD_RULES.hasNumber(password),
    hasSymbol: PASSWORD_RULES.hasSymbol(password),
  }
}

// 1. Schema para Iniciar Sesión (6.1)
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Ingresá un email válido'),
  password: z
    .string()
    .min(1, 'La contraseña no puede estar vacía'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// 2. Schema para Registro (6.2)
export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'El nombre completo es requerido'),
    email: z
      .string()
      .min(1, 'El email es requerido')
      .email('Ingresá un email válido'),
    password: z
      .string()
      .min(8, 'Debe tener al menos 8 caracteres')
      .refine(PASSWORD_RULES.hasUppercase, 'Debe incluir al menos una mayúscula')
      .refine(PASSWORD_RULES.hasLowercase, 'Debe incluir al menos una minúscula')
      .refine(PASSWORD_RULES.hasNumber, 'Debe incluir al menos un número')
      .refine(PASSWORD_RULES.hasSymbol, 'Debe incluir al menos un símbolo'),
    confirmPassword: z.string().min(1, 'Confirmá tu contraseña'),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'Debés aceptar los términos y condiciones para continuar',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

// 3. Schema para Recuperar Contraseña (6.4)
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Ingresá un email válido'),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

// 4. Schema para Nueva Contraseña (6.5)
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Debe tener al menos 8 caracteres')
      .refine(PASSWORD_RULES.hasUppercase, 'Debe incluir al menos una mayúscula')
      .refine(PASSWORD_RULES.hasLowercase, 'Debe incluir al menos una minúscula')
      .refine(PASSWORD_RULES.hasNumber, 'Debe incluir al menos un número')
      .refine(PASSWORD_RULES.hasSymbol, 'Debe incluir al menos un símbolo'),
    confirmPassword: z.string().min(1, 'Confirmá tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
