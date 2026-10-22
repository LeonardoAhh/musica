# Ecos del Alma

Una publicación editorial independiente para descubrir canciones memorables.

## Desarrollo

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run build
```

Usa Node.js 22 o 24 LTS. El repositorio oficial es [LeonardoAhh/musica](https://github.com/LeonardoAhh/musica). Al integrar cambios en `main`, Vercel puede desplegarlos automáticamente.

## Rutas breves

- `/c/me-tengo-que-ir` — ficha de canción (ID editorial).
- `/a/maelo-ruiz` — ficha de artista (slug normalizado).

Las páginas incluyen metadatos y rutas generadas a partir del catálogo. Los enlaces a Spotify abren una búsqueda, no pistas verificadas.

## Interacciones

Motion (importado de `motion/react`) anima la entrada del hero con soporte `prefers-reduced-motion`.

Cuelume (`cuelume@0.2.8`) añade pistas sonoras a controles marcados con `data-cuelume-*`. **El sonido está desactivado por defecto**; la persona lo activa pulsando el icono de volumen en el encabezado. El volumen está limitado a 28%. No hay audio alojado ni reproducción automática de canciones.

## Diseño

Paleta editorial clara, tipografía Cormorant Garamond + Inter, favicon SVG de vinilo original y detalles atmosféricos suaves. `DESIGN.md` documenta tokens y reglas visuales. Las portadas son artes tipográficos originales.

## Validación antes de fusionar

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

Probar `/c/me-tengo-que-ir`, `/a/maelo-ruiz`, compartir enlaces, audio apagado/encendido, teclado, y móvil 360px / tablet 820px / escritorio 1440px.

**Nota:** la integración se prepara por cambios de código en GitHub; el build y la prueba acústica real necesitan ejecutarse en una instalación con dependencias.

## Morphicons

Los iconos con cambio de estado (menú abierto/cerrado y guardar/quitar guardado) usan `morphicons/react` con trazados SVG compatibles con Lucide, evitando versiones incompatibles de IconNode. Los iconos estáticos siguen usando `lucide-react`. Se respeta `reducedMotion="user"` para evitar animaciones si así lo prefiere la persona.

Instalación: `npm install`. Verifica `npm run typecheck && npm run build`.

## PWA y criterios UX
- Manifiesto y SVG 192/512, con service worker de fallback de navegación; sin audio de terceros en caché.
- Banner contextual descartable: Android/Chromium usa beforeinstallprompt; iOS muestra instrucciones para Compartir > Agregar a inicio.
- Sonido apagado inicialmente, ninguna interacción invasiva; reducción de movimiento, safe area y zoom manual intactos.
- Comprobar instalación real iOS/Android y soporte de iconos; añadir PNG antes de dar por cerrada la compatibilidad.


## PWA — instalación y modo offline

- `/manifest.webmanifest`: identificación visual de Ecos del Alma; iconos SVG de 192 y 512 px.
- `/sw.js`: precarga `/offline.html` y lo ofrece únicamente si falla una navegación de la misma web. No se almacena música ni contenido de terceros.
- Aviso contextual de instalación: aparece cuando se ha explorado la página y el navegador permite instalarla. Se oculta mientras se edita un campo, en modo standalone o tras descartarlo durante 30 días.
- En Android/Chromium, **Instalar** utiliza `beforeinstallprompt` cuando el navegador emite el evento; en iOS ofrece la ruta manual de Compartir.
- No se bloquea la ampliación manual ni se activa el teclado automáticamente.

### Verificación antes de producción

1. `npm run typecheck && npm run lint && npm run build`.
2. En Android/Chrome comprobar instalación, icono, lanzamiento standalone y cierre del banner.
3. En iOS comprobar Compartir → Agregar a pantalla de inicio y el comportamiento standalone.
4. Con el sitio abierto previamente, desactivar la conexión y navegar a otra ruta: debe aparecer la pantalla offline.
5. Comprobar enfoque, modo de movimiento reducido, campos a 16 px y controles táctiles.

**Pendiente de compatibilidad máxima:** iconos PNG dedicados para el manifiesto y Apple Touch; actualmente se utilizan SVG. El instalador de navegador depende del soporte del dispositivo y no está garantizado en todos los navegadores.


## Valoración personal y Firebase

Cada ficha y el panel de canción permiten calificar de **1 a 5 estrellas**. No es una puntuación pública: la nota editorial **/10** sigue separada. La calificación se conserva en el dispositivo, incluso sin configurar Firebase.

Para conectar Firebase `ecos-del-alma-c7ee2`:

1. Copia `.env.example` a `.env.local` en desarrollo y configura las seis variables `NEXT_PUBLIC_FIREBASE_*` en **Vercel → Settings → Environment Variables**, para Preview y Production. Vuelve a desplegar.
2. Activa **Firebase Authentication → Sign-in method → Anonymous**.
3. Crea **Cloud Firestore** en modo producción (reglas restrictivas).
4. Publica `firestore.rules` desde la consola o con `npx firebase-tools deploy --only firestore:rules --project ecos-del-alma-c7ee2` tras iniciar sesión con `npx firebase-tools login`.

Las claves web de Firebase identifican el proyecto, no son credenciales administrativas. **La seguridad depende de las reglas de Firestore**, que restringen cada valoración al usuario autenticado. No hay claves de servicio en este repositorio.

Al votar, el navegador guarda la valoración y, cuando Firebase esté conectado, la envía bajo `users/{uid}/ratings/{songId}` con autenticación anónima. Un usuario anónimo no equivale a una cuenta entre dispositivos; para sincronización real entre ellos será necesario iniciar sesión y vincular las identidades.

Las rutas `users/{uid}/preferences/...` y `songs/...` quedan reservadas. La publicación futura de canciones exigirá un rol de administrador, no escrituras públicas.

## Hoja móvil y estados de catálogo

En pantallas de hasta 767px, el detalle emerge desde abajo, se desplaza dentro de su propia superficie y se cierra desde el tirador, el botón, el fondo o Escape. En escritorio sigue centrado. El foco se restaura al cerrar y se respeta movimiento reducido.

Los resultados vacíos se alinean con el catálogo. No se asignan alturas intrínsecas ficticias a las tarjetas, evitando huecos de distribución.


## Ecos Studio — catálogo administrado con Firestore

Ruta local: `http://localhost:3000/studio`. **No usa Vercel para estas pruebas.**

### Preparación segura

1. Crea tu `.env.local` a partir de `.env.example` y pega allí los valores del proyecto web Firebase. No publiques `.env.local`.
2. Activa **Authentication → Google** para editores y **Anonymous** para las valoraciones personales.
3. Crea Cloud Firestore y despliega `firestore.rules` antes de escribir datos:

   ```powershell
   npx firebase-tools login
   npx firebase-tools deploy --only firestore:rules --project ecos-del-alma-c7ee2
   ```

4. Inicia sesión con Google en `/studio` una vez. La pantalla todavía indicará «Acceso restringido» hasta asignar el rol.
5. En **Firebase Authentication → Users**, localiza el UID de tu cuenta Google. Desde una terminal **local y privada**, con credenciales administrativas descargadas de una cuenta de servicio, configura:

   ```powershell
   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\RUTA_PRIVADA\firebase-admin.json"
   $env:GOOGLE_CLOUD_PROJECT="ecos-del-alma-c7ee2"
   npm run studio:grant-admin -- TU_UID_DE_FIREBASE
   ```

   Guarda el archivo JSON fuera del repositorio y jamás lo envíes al chat ni lo subas a GitHub. Ese script usa Firebase Admin SDK únicamente **en tu computadora**, no en el navegador. Vuelve a iniciar sesión para actualizar los permisos.
6. Importa el catálogo inicial desde el botón **Importar catálogo inicial**. Se ignoran documentos que ya existen. Después podrás añadir canciones como borradores y publicarlas.

### Migración gradual

La página arranca en modo `hybrid`: muestra el catálogo local y las canciones publicadas de Firestore; si un ID coincide, gana la versión Firestore. Los borradores nuevos no aparecen. Si quieres que **solo Firestore** controle la colección, después de importarla completamente cambia:

```dotenv
NEXT_PUBLIC_CATALOG_MODE=firestore
```

Sin una configuración Firebase válida, la biblioteca local continúa disponible. Las nuevas canciones publicadas obtienen páginas breves `/c/[id]`, y los artistas nuevos `/a/[slug]`, mediante lectura pública de Firestore. Las páginas históricas generadas previamente aún conservan parte de sus datos originales en el renderizado del servidor: actualizaremos su SEO e hidratación dinámica en otra iteración.

### Actualizar VS Code y hacer push sin perder trabajo

Si tu carpeta ya está conectada a `https://github.com/LeonardoAhh/musica.git`:

```powershell
git status
git fetch origin
git switch main
git pull --ff-only origin main
git switch --track origin/feat/ecos-studio-firestore-catalog
npm install
npm run typecheck
npm run lint
npm run build
npm run dev
```

Si Git indica que la rama local **ya existe**, usa `git switch feat/ecos-studio-firestore-catalog` y `git pull --ff-only` en lugar de repetir `--track`. Si `git status` muestra cambios sin guardar, **haz commit o stash antes de cambiar de rama**; no ejecutes `reset --hard` ni `push --force`.

Después de editar, desde esa misma rama:

```powershell
git add .
git commit -m "feat: ajustes locales en Ecos Studio"
git push -u origin feat/ecos-studio-firestore-catalog
```

El push sube únicamente esa rama a GitHub. **No fusionamos a `main` hasta que pases las pruebas locales.** Revisa que no se incluyan credenciales ni `.env.local` antes del commit.

### Seguridad

El panel no garantiza privacidad por estar en `/studio`: las reglas Firestore exigen un **custom claim `admin: true`** firmado por el servidor. No hay manera de asignarlo desde el código del cliente. Visitantes anónimos solo leen canciones publicadas; borradores y escrituras están restringidos. Guardamos las valoraciones personales en `users/{uid}/ratings/{songId}` y las preferencias futuras continúan bloqueadas hasta validar su estructura. Las variables `NEXT_PUBLIC_*` de Firebase son públicas por diseño; nunca son claves de administrador.

**Importante:** no se han habilitado proveedores de Firebase, publicado reglas ni probado credenciales desde este entorno. Debes hacer esas operaciones conscientemente en la consola de tu proyecto.
