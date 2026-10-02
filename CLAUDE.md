# CLAUDE.md

Guía para Claude Code (claude.ai/code) al trabajar en este repositorio.

## Qué es

Portal de alumnas de Studio Dancers ("Mi Studio"): PWA en React 19 + Vite 7 + Tailwind 4, desplegada en Vercel. Repo `studio-dancers-portal`, rama **`master`**.

Comparte la **misma base Supabase** con el Admin (`D:\Mi archivo\01 Trabajo\Studio Dancers\Desarrollo\Studio Dancers Adm`). Cualquier cambio de esquema, RLS o RPC afecta a ambos: las migraciones (`database-update-v*.sql`) viven en el repo del Admin.

## Comandos

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build + scripts/patch-sw-register.mjs
npm run lint       # ESLint
npm run preview    # Previsualizar el build
```

No hay tests. Se verifica en el navegador (vista móvil). `D:\Studio Dancers Portal` es un acceso directo a `D:\Mi archivo\01 Trabajo\Studio Dancers\Desarrollo\Studio Dancers Portal`: arrancar Vite desde la ruta real (desde el acceso directo no compila el JSX).

## Flujo de trabajo

- **Antes de cambiar nada:** leer los archivos implicados en `src/` y entender cómo entra la alumna y cómo se muestra su estado.
- Cuando se pidan "mejoras", proponer primero (sin funciones nuevas) y esperar aprobación antes de editar.
- Subir a GitHub con:
  ```bash
  git push https://danrivzam-ai@github.com/danrivzam-ai/studio-dancers-portal.git master
  ```

## Autenticación (sin Supabase Auth)

- La alumna entra con **cédula + últimos 4 dígitos del teléfono** vía `rpc_client_login(p_cedula, p_phone_last4)` (`src/components/Login.jsx`, `src/App.jsx`).
- La sesión se guarda en `sessionStorage('portal_session')`.
- "Recordar este dispositivo" guarda en `localStorage('studio_device_token')` solo un token opaco (`rpc_client_device_register`, v47); al abrir se canjea con `rpc_client_device_login` y al cerrar sesión se revoca. Nunca guardar cédula ni teléfono en `localStorage`.
- El cliente usa solo la **anon key** (`src/lib/supabase.js`). No hay sesión de Supabase Auth, por lo tanto:
  - Todo acceso a datos de alumnas pasa por **funciones RPC `SECURITY DEFINER`** (`rpc_client_*`, `rpc_public_courses`, etc.).
  - Las reglas RLS por rol (v42: `admin`, `receptionist`, `viewer`, `supervisor`, `contador`) son **solo para el personal**; no aplican aquí. No añadir lecturas directas `supabase.from('tabla')` de datos privados: crear/usar una RPC.
  - Toda RPC nueva debe validar cédula + teléfono dentro de la función (helper `_portal_student_ids`, v46) y devolver solo los datos de esa familia.
  - `rpc_client_login` bloquea 10 min tras 5 intentos fallidos por cédula (v46); el error llega con `hint = 'rate_limited'`.
  - Reportes de ciclo: `rpc_client_reportes` y `rpc_client_cycle_evaluations` (v46). No leer `reportes_ciclo` ni `cycle_evaluations` directo.
- Lo que necesita un secreto o escribir en Storage va por **Edge Functions** (código en el repo del Admin, `supabase/functions/`):
  - `notify-transfer` — aviso de Telegram tras subir un comprobante (recibe solo `requestId`; el token del bot vive en `school_settings`).
  - `upload-avatar` — foto de perfil; valida cédula + teléfono. El bucket `avatars` no acepta escritura anónima (v47).
- Ningún secreto en variables `VITE_*`: todo lo que empieza con `VITE_` queda en el JS público.

## Estado de pago

- Usar `getPortalStatus(student)` de `src/lib/dateUtils.js`: es `getPaymentStatus()` del Admin (copiado línea a línea) más los casos de cortesía y pausa. **Nunca** usar el campo crudo `student.payment_status` para decidir lo que ve la alumna.
- Si cambia `getPaymentStatus()` en el Admin, replicar el cambio en `src/lib/dateUtils.js` del portal.
- El estado necesita los datos del curso: `Dashboard.jsx` enriquece cada alumna con `rpc_public_courses` (`price_type`, `class_days`, `classes_per_cycle`, `age_min`, `course_price`). `class_days` en el portal usa ISO (1=Lun … 7=Dom); `courseFromStudent()` lo convierte a la convención del Admin (0=Dom … 6=Sáb).
- Respetar `priceType` del curso (`mes`, `paquete`, `programa`) y la tarifa histórica (`student.monthly_fee`), como en el Admin.

## Fechas

- Siempre hora de **Ecuador (America/Guayaquil, UTC-5)**: usar `getTodayEC()` / `getNowEC()` de `src/lib/dateUtils.js`.
- No usar `new Date()` / `toISOString()` para "hoy": después de las 7 PM en Ecuador ya es el día siguiente en UTC.
- Fechas de Supabase tipo `'yyyy-MM-dd'`: parsear a mediodía local (como `toNoonLocal()` del Admin) para evitar el corrimiento de día.

## Recibos y datos financieros

- Los **números de recibo los asigna la base** (secuencias v41/v44). El portal nunca genera ni calcula números de recibo.
- El portal no registra pagos: solo envía comprobantes (`rpc_client_submit_transfer` + bucket `transfer-receipts`) que el personal aprueba en el Admin.
- `src/lib/banks.js` (bancos de origen del comprobante) debe mantenerse sincronizado con la lista de bancos del Admin.
- Las cuentas del estudio para transferir vienen de `rpc_client_get_bank_accounts()` (`school_settings.portal_bank_accounts`, editable en Configuración del Admin). No escribir cuentas ni cédulas en el código.

## Diseño y marca

- Color principal vino **`#551735`** (secundarios `#6b2145`, `#3d0f25`, rosados `#f9e8f0` / `#e8b4cc`). Mantener coherencia con el Admin.
- **Modo oscuro** automático según el teléfono: `index.html` pone `.dark` en `<html>` y `src/styles/theme-dark.css` (generado por `node scripts/gen-dark-theme.cjs`, mismo método que el Admin) redefine la paleta de Tailwind y los hex de marca. Si usas un hex nuevo en una clase (`bg-[#…]`), agrégalo al script y regenera. Los estilos inline (`style={{…}}`) no se adaptan: preferir clases. Bloques que deben quedar claros: clase `force-light`.
- Mobile-first (es una PWA instalada en teléfonos): inputs con `text-base` (evita zoom en iOS), áreas táctiles amplias.
- No usar el emoji 🩰 (no se ve en Android antiguos).

## PWA y caché

- `vite.config.js` configura `vite-plugin-pwa` con NetworkFirst para JS/CSS/HTML y Supabase.
- `src/main.jsx` limpia service workers y cachés cuando cambia `APP_VERSION`; subir esa versión si un cambio requiere forzar la actualización en los teléfonos.

## Variables de entorno

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```
