import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StatusBar as RNStatusBar,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/context/AuthContext'
import { Colors, Spacing } from '@/constants/theme'

/**
 * Destino del deep link de confirmación de email (ibanktp://confirm).
 * AuthContext canjea el código por una sesión y el guardián de rutas
 * redirige a Home automáticamente (Sección 6.3).
 */
export default function ConfirmScreen() {
  const router = useRouter()
  const { linkError, isProcessingLink } = useAuth()

  if (!linkError || isProcessingLink) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.subtitle}>Confirmando tu cuenta...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <RNStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.iconCircleError}>
            <Ionicons name="time-outline" size={44} color="#DC2626" />
          </View>
          <Text style={styles.title}>No pudimos confirmar tu email</Text>
          <Text style={styles.subtitle}>{linkError}</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace('/(auth)/login')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Volver a Iniciar sesión</Text>
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
    alignItems: 'center',
    gap: 16,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.borderRadiusCard,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  iconCircleError: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: Colors.errorBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    width: '100%',
    height: 52,
    borderRadius: Spacing.borderRadiusButton,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
})
