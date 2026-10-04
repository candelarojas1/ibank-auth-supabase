import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native'
import { useAuth } from '@/context/AuthContext'
import { Ionicons } from '@expo/vector-icons'

export default function HomeScreen() {
  const { user, signOut } = useAuth()
  const fullName = user?.user_metadata?.full_name || 'Usuario'

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header con saludo */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bienvenido a iBank 👋</Text>
            <Text style={styles.userName}>{fullName}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{fullName.charAt(0).toUpperCase()}</Text>
          </View>
        </View>

        {/* Tarjeta de estado de sesión */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark" size={24} color="#10B981" />
            <Text style={styles.cardTitle}>Sesión Autenticada</Text>
          </View>
          <Text style={styles.cardDetail}>Email: {user?.email}</Text>
          <Text style={styles.cardDetail}>ID: {user?.id?.substring(0, 18)}...</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Cuenta Verificada</Text>
          </View>
        </View>

        {/* Botón de Logout (Sección 7.3) */}
        <TouchableOpacity style={styles.logoutButton} onPress={signOut} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFC',
  },
  container: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  greeting: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'System',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0F4C81',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cardDetail: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  badgeText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
})
