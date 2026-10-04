# iBank — Flujo de Autenticación Móvil

Aplicación móvil desarrollada en **React Native** con **Expo** y conectada a **Supabase Auth** como servicio de autenticación. La app implementa el flujo completo de autenticación de una banca digital (inicio de sesión, registro con verificación en tiempo real, confirmación por correo, recuperación y restablecimiento de contraseña).

---

## ⚙️ Variables de Entorno Necesarias

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables (se obtienen en el dashboard de Supabase → *Project Settings → API*):

```env
EXPO_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
```

> Solo la **anon/publishable key** vive en el cliente. La `service_role` key nunca se incluye en la app.

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

### Probar los deep links del email
Los links de confirmación y de reset usan el flujo **PKCE**, por lo que deben abrirse **en el mismo dispositivo** donde se hizo el registro o el pedido de reset (por ejemplo, con `xcrun simctl openurl booted "<link>"` en el simulador de iOS).

> **Expo Go:** en Expo Go la app vuelve a una URL del tipo `exp://<IP-de-la-PC>:8081/--/confirm`, que no está en la lista de Redirect URLs (solo se configuraron las de `ibanktp://`). En ese caso Supabase redirige a la Site URL: la cuenta queda confirmada igual, pero la app no recibe la sesión y el formulario de nueva contraseña no se puede abrir. Para probar los links de punta a punta en Expo Go hay que agregar esas URLs `exp://` en *Authentication → URL Configuration*.

### Plataformas probadas
- **iOS (simulador):** probado.
- **Android:** _completar si se probó o no_.

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

## 🧭 Decisiones Técnicas

### Persistencia de la sesión: AsyncStorage
Se eligió **`@react-native-async-storage/async-storage`**, siguiendo el quickstart oficial de Supabase para React Native:
- Funciona en **Expo Go** sin necesidad de un development build.
- La sesión de Supabase (JSON con access y refresh token) supera los **2048 bytes**, que es el límite recomendado por valor en `expo-secure-store`; usar SecureStore requeriría cifrar la sesión y guardar solo la clave en el keychain, lo que agrega complejidad fuera del foco del TP (UI + reglas de negocio).
- En web se usa `localStorage` mediante un adaptador propio (`src/lib/supabase.ts`).

**Contrapartida:** AsyncStorage no está cifrado. Para producción, la alternativa recomendada sería cifrar la sesión con una clave guardada en `expo-secure-store`.

### Flujo PKCE para los deep links
El cliente usa `flowType: 'pkce'`. Los links del email llegan como `ibanktp://confirm?code=...` o `ibanktp://reset-password?code=...`; `AuthContext` captura la URL con `expo-linking` y la canjea con `exchangeCodeForSession`, que emite el evento `PASSWORD_RECOVERY` en el caso del reset. Si el link está vencido o es inválido, se muestra una pantalla de error propia con la opción de pedir uno nuevo.

### Otras decisiones
- **Validaciones:** `react-hook-form` + `zod`, en modo `onChange` para habilitar o deshabilitar los botones en tiempo real.
- **Navegación:** `expo-router` con grupos `(auth)` y `(app)`; el guardián de `_layout.tsx` muestra un spinner mientras se resuelve la sesión inicial, para evitar el parpadeo del login.
- **Anti-enumeración:** el login muestra un único mensaje genérico; el registro de un email ya existente sigue el mismo camino que un alta nueva; el reset muestra siempre el mismo mensaje neutro.
- **Rate limit:** ante un error 429, los botones de envío quedan deshabilitados con una cuenta regresiva de 60 segundos.
- **Mapeo de errores:** `src/utils/errors.ts` traduce los códigos de Supabase a mensajes en español; los errores desconocidos muestran un mensaje genérico en vez del texto técnico.

---

## 🎨 Diseño (Figma iBank)

### Mapeado tal cual
- Paleta de colores (`src/constants/theme.ts`): primario `#3629B7`, texto `#1B1C52`, texto secundario `#8F92A1`, bordes `#E2E4E8`, botón deshabilitado `#F2F1FB` / `#B8B7D8`.
- Cabecera púrpura con tarjeta blanca de bordes curvos, ilustraciones con puntos de colores, textos de pantallas en inglés como en el kit ("Sign in", "Sign up", "Forgot password", "Change password").
- Pantalla de éxito "Change password successfully!".

### Adaptado
- **Checklist de contraseña:** no existe en el Figma; se agregó para cumplir la regla 6.2 (validación visual en tiempo real).
- **Mensajes de error y estados:** los mensajes de negocio están en español (pedido por la consigna) aunque el kit esté en inglés.
- **Pantallas sin equivalente en el Figma:** confirmación pendiente, procesando confirmación y link vencido; se construyeron con el mismo estilo visual del kit.
- **Cooldown de 60 s:** se muestra dentro del botón ("Reintentar en (Ns)").

### Fuera de alcance
Login social, verificación OTP como segundo factor, PIN/biometría, CAPTCHA y la tabla `profiles` sincronizada por trigger (el nombre se guarda en `user_metadata`).

---

## 🔐 Configuración de Supabase (Authentication)

> ⚠️ _Verificar y completar con los valores reales del dashboard._

| Ítem | Valor configurado |
|---|---|
| Confirm email | Activado |
| Longitud mínima de contraseña | 8 caracteres |
| Complejidad de contraseña | Mayúscula, minúscula, dígito y símbolo |
| Leaked password protection | No disponible (requiere plan Pro) |
| Rate limits | Valores por defecto (60 s por usuario en signup/recover) |
| Expiración de link/OTP | 3600 segundos |
| SMTP | Proveedor incluido (límite de 2 emails/hora); en producción usar SMTP propio |
| Redirect URLs | `ibanktp://confirm`, `ibanktp://reset-password` |
| CAPTCHA | No implementado |
