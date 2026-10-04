/**
 * Mapeo centralizado de errores de Supabase Auth a mensajes claros en español.
 * Requerimiento de la Sección 7.4 de la consigna.
 */
type AuthLikeError = { code?: string; status?: number; message?: string } | null | undefined

function matches(error: AuthLikeError, code: string, ...messageFragments: string[]): boolean {
  if (!error) return false
  if (error.code === code) return true
  const message = error.message?.toLowerCase() || ''
  return messageFragments.some((fragment) => message.includes(fragment))
}

// Límite por hora de emails del proyecto (no se libera a los 60 segundos)
const isEmailSendRateLimitError = (error: AuthLikeError) =>
  matches(error, 'over_email_send_rate_limit', 'email rate limit')

export const isRateLimitError = (error: AuthLikeError) =>
  error?.status === 429 ||
  matches(error, 'over_request_rate_limit', 'rate limit') ||
  isEmailSendRateLimitError(error)

export const isEmailNotConfirmedError = (error: AuthLikeError) =>
  matches(error, 'email_not_confirmed', 'email not confirmed')

export const isUserAlreadyExistsError = (error: AuthLikeError) =>
  matches(error, 'user_already_exists', 'user already registered') ||
  matches(error, 'email_exists', 'already been registered')

export function getErrorMessage(error: any): string {
  if (!error) return ''

  // Se agotó el cupo de emails por hora del proyecto
  if (isEmailSendRateLimitError(error)) {
    return 'Se alcanzó el límite de envío de emails. Probá de nuevo más tarde.'
  }

  // Error de demasiados intentos (Rate Limit / 429)
  if (isRateLimitError(error)) {
    return 'Demasiados intentos. Por favor esperá 60 segundos antes de volver a intentar.'
  }

  // Credenciales inválidas (anti-enumeración: mensaje genérico para email o clave incorrectos)
  if (matches(error, 'invalid_credentials', 'invalid login credentials')) {
    return 'Email o contraseña incorrectos.'
  }

  // Email no confirmado
  if (isEmailNotConfirmedError(error)) {
    return 'Tu email aún no ha sido confirmado. Revisá tu bandeja de entrada.'
  }

  // Usuario ya registrado (anti-enumeración: mismo mensaje neutro que un registro exitoso)
  if (isUserAlreadyExistsError(error)) {
    return 'Revisá tu email para continuar.'
  }

  // Contraseña débil
  if (matches(error, 'weak_password', 'password should be')) {
    return 'La contraseña no cumple con los requisitos mínimos de seguridad.'
  }

  // La nueva contraseña es igual a la anterior
  if (matches(error, 'same_password', 'should be different')) {
    return 'La nueva contraseña debe ser distinta de la anterior.'
  }

  // Link de email vencido o inválido
  if (matches(error, 'otp_expired', 'expired', 'invalid flow state', 'code verifier')) {
    return 'El enlace venció o no es válido. Solicitá uno nuevo.'
  }

  // Errores de red o conexión
  if (
    error.name === 'AuthRetryableFetchError' ||
    matches(error, 'network_error', 'fetch failed', 'network error', 'failed to fetch', 'network request failed')
  ) {
    return 'Error de conexión. Verificá tu acceso a internet e intentá de nuevo.'
  }

  return 'Ocurrió un error inesperado. Por favor volvé a intentarlo.'
}
