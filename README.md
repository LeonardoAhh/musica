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
