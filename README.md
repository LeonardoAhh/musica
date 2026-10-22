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

Los iconos con cambio de estado (menú abierto/cerrado y guardar/quitar guardado) usan `morphicons/react` con datos SVG del paquete `lucide` (no `lucide-react`). Los iconos estáticos siguen usando `lucide-react`. Se respeta `reducedMotion="user"` para evitar animaciones si así lo prefiere la persona.

Instalación: `npm install`. Verifica `npm run typecheck && npm run build`.
