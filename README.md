# iBank — Flujo de Autenticación Móvil

Aplicación móvil desarrollada en **React Native** con **Expo** y conectada a **Supabase Auth** como servicio de autenticación. La app implementa el flujo completo de autenticación de una banca digital (inicio de sesión, registro con verificación en tiempo real, confirmación por correo, recuperación y restablecimiento de contraseña).

---

## ⚙️ Variables de Entorno Necesarias

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
EXPO_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
```
---

## 📥 Instrucciones de Instalación

1. **Abrir la carpeta del proyecto**:
   ```bash
   cd "TP3-React Native"
   ```

2. **Instalar las dependencias del proyecto**:
   ```bash
   npm install
   ```

---

## 🚀 Cómo Correr el Proyecto

Para iniciar el servidor de desarrollo de Expo e ingresar desde la aplicación **Expo Go** o un emulador:

```bash
npx expo start
```

### Opciones de ejecución:
- Presionar **`a`** para abrir en emulador de Android.
- Presionar **`i`** para abrir en emulador de iOS.
- Escanear el código QR mostrado en la terminal desde la app **Expo Go** en tu celular.


### Plataformas probadas
- **iOS (simulador):** probado.

---

## 🗂️ Estructura

```
src/
├── app/
│   ├── _layout.tsx          # Guardián de rutas protegidas (7.2)
│   ├── (auth)/              # Pantallas públicas
│   │   ├── login.tsx                 # 6.1 Iniciar sesión
│   │   ├── register.tsx              # 6.2 Registro
│   │   ├── pending-confirmation.tsx  # 6.3 Confirmación pendiente
│   │   ├── confirm.tsx               # Destino del deep link de confirmación
│   │   ├── forgot-password.tsx       # 6.4 Recuperar contraseña
│   │   └── reset-password.tsx        # 6.5 Nueva contraseña
│   └── (app)/index.tsx      # Home (requiere sesión)
├── context/AuthContext.tsx  # Sesión, eventos de Supabase y deep links
├── lib/supabase.ts          # Cliente de Supabase
└── utils/
    ├── validations.ts       # Schemas zod + reglas de contraseña
    └── errors.ts            # Mapeo centralizado de errores (7.4)
```

---



