import { Stack } from 'expo-router'

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FAFAFC' },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  )
}
