# Handoff Spec — Tramita® Brand Identity

> **Producto:** Tramita® — AutomatizAI  
> **Versión:** 1.0  
> **Fecha:** 2026-05-23  
> **Estado:** Aprobado para implementación

---

## 1. Concepto y nombre

El nombre es un cuádruple juego de palabras:

| Capa | Significado |
|------|-------------|
| "Deja de webear" | Modismo chileno: deja de hacer perder el tiempo |
| WEB | Tecnología web |
| automatización | Inteligencia Artificial |
| ® | Irónico — se burla de la formalidad burocrática que combate |
| `/WEB-automatización` | Se lee como ruta URL — refuerza el stack tecnológico |

**Tagline oficial:** *"La automatización que termina con la burocracia"*

---

## 2. Design Tokens

### Colores

| Token | Hex | RGB | Uso |
|-------|-----|-----|-----|
| `color-brand-black` | `#0A0A0E` | rgb(10, 10, 14) | Texto principal, brackets, D/JA monogram, fondo ícono |
| `color-brand-orange` | `#E65100` | rgb(230, 81, 0) | Acento automatización®, rayo del ícono |
| `color-brand-bg` | `#F5F5F0` | rgb(245, 245, 240) | Fondo de página, fondos claros |
| `color-brand-white` | `#FFFFFF` | rgb(255, 255, 255) | JA invertido dentro del monograma D |

### Tipografía

| Token | Valor | Uso |
|-------|-------|-----|
| `font-brand` | Barlow Condensed Black (weight 900) | Logo, wordmark, todas las aplicaciones de marca |
| `font-brand-fallback` | Impact, Arial Narrow, sans-serif | Fallback si Barlow no carga |
| `font-ui` | Syne (700/800) | UI del producto (landing, app) |
| `font-ui-fallback` | -apple-system, BlinkMacSystemFont | Fallback UI |

**Carga de fuente (Google Fonts):**
```html
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&family=Syne:wght@400;700;800&display=swap" rel="stylesheet">
```

### Espaciado y forma

| Token | Valor | Uso |
|-------|-------|-----|
| `radius-icon` | 16px (proporcional ~12% del ancho) | Ícono cuadrado standalone |
| `radius-card` | 20px | Cards de la UI |
| `shadow-card` | `0 2px 16px rgba(0,0,0,.06)` | Elevación de cards |

---

## 3. Variantes del logo

### 3.1 Logo horizontal (uso principal)

```
[ DJA /WEB-automatización® ]
```

**Estructura:**
- `[` — bracket apertura, Barlow Condensed Black, `color-brand-black`
- `D` — letra gigante (hero), Barlow Condensed Black, `color-brand-black`
- `JA` — stacked verticalmente dentro/sobre la D, Barlow Condensed Black, `color-brand-white` (reversed out)
- `/WEB-` — Barlow Condensed Black, `color-brand-black`
- `automatización` — Barlow Condensed Black, `color-brand-orange`
- `®` — superíndice, ~30% del tamaño del wordmark, `color-brand-orange`
- `]` — bracket cierre, Barlow Condensed Black, `color-brand-black`

**Proporciones:**
- Altura del logo: reference unit `H`
- `D` monogram: `H × 1.0` (full height)
- `JA` dentro del D: `H × 0.38` cada letra
- `/WEB-` y `automatización`: `H × 0.78`
- Brackets `[ ]`: `H × 1.05`
- `®`: `H × 0.26`
- Spacing mínimo alrededor del logo: `H × 0.25` en todos los lados

**Letter-spacing:** `-0.03em` en el wordmark `/WEB-automatización`

### 3.2 Wordmark plano (uso secundario)

```
Tramita®
```

Sin brackets, sin monograma. Todo en mayúsculas.
- `DJADWEB-` en `color-brand-black`
- `automatización®` en `color-brand-orange`

### 3.3 Ícono standalone (favicon / app icon)

- Fondo: cuadrado con `border-radius: 12%`, `color-brand-black`
- Símbolo: rayo (lightning bolt) geométrico, `color-brand-orange`
- El rayo ocupa ~58% del ancho del cuadrado
- Posición: centrado horizontal y verticalmente
- Margen interno del rayo al borde: ~21% del ancho del cuadrado

**Tamaños requeridos:**
| Uso | Tamaño |
|-----|--------|
| Favicon `.ico` | 16×16, 32×32, 48×48 |
| Apple Touch Icon | 180×180 |
| Android / PWA | 192×192, 512×512 |
| App stores | 1024×1024 |

### 3.4 Variante Monochrome

Logo horizontal en escala de grises:
- `D` monogram: `#888888`
- `JA` dentro del D: `#FFFFFF`
- `/WEB-` : `#1A1A1A`
- `automatización®`: `#888888` (mantiene distinción por peso visual)

### 3.5 Variante Reverchrome (sobre fondo oscuro)

- Fondo: `color-brand-black`
- `[` `]` brackets: `#FFFFFF`
- `D` monogram: `#AAAAAA`
- `JA`: `#0A0A0E`
- `/WEB-`: `#FFFFFF`
- `automatización®`: `color-brand-orange` (sin cambio)

---

## 4. Uso correcto e incorrecto

### ✅ Permitido
- Logo horizontal sobre `#F5F5F0`
- Logo horizontal sobre `#FFFFFF`
- Logo horizontal sobre `#0A0A0E` (variante reverchrome)
- Wordmark plano cuando el espacio es reducido (< 200px de ancho)
- Ícono standalone para favicon, app icon, avatar

### ❌ Prohibido
- Cambiar los colores de `DJADWEB-` a naranja o viceversa
- Usar el logo sobre fondos de color que no sean las variantes aprobadas
- Estirar o distorsionar las proporciones
- Usar fuente distinta a Barlow Condensed Black para el wordmark
- Añadir sombras, gradientes o efectos al logo
- Rotar el logo
- Tamaño mínimo: 120px de ancho para logo horizontal; 24px para ícono

---

## 5. Implementación CSS

```css
/* ── Design Tokens ── */
:root {
  --brand-black:  #0A0A0E;
  --brand-orange: #E65100;
  --brand-bg:     #F5F5F0;
  --brand-white:  #FFFFFF;

  --font-brand: 'Barlow Condensed', Impact, Arial Narrow, sans-serif;
  --font-ui:    'Syne', -apple-system, BlinkMacSystemFont, sans-serif;

  --radius-icon: 16px;
  --radius-card: 20px;
  --shadow-card: 0 2px 16px rgba(0, 0, 0, 0.06);
}

/* ── Logo Wordmark ── */
.logo-wordmark {
  font-family: var(--font-brand);
  font-weight: 900;
  font-size: clamp(24px, 5vw, 48px);
  letter-spacing: -0.03em;
  line-height: 1;
  white-space: nowrap;
}

.logo-wordmark .black  { color: var(--brand-black); }
.logo-wordmark .orange { color: var(--brand-orange); }
.logo-wordmark .reg    { font-size: 0.3em; vertical-align: super; }

/* ── App Icon ── */
.brand-icon {
  background: var(--brand-black);
  border-radius: 22%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
}
```

```html
<!-- Logo horizontal -->
<div class="logo-wordmark">
  <span class="black">[DJA /WEB-</span><span class="orange">automatización<sup class="reg">®</sup></span><span class="black">]</span>
</div>

<!-- Wordmark plano -->
<div class="logo-wordmark">
  <span class="black">DJADWEB-</span><span class="orange">automatización<sup class="reg">®</sup></span>
</div>
```

---

## 6. SVG del ícono (rayo)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <!-- Fondo negro -->
  <rect width="100" height="100" rx="16" fill="#0A0A0E"/>
  <!-- Rayo naranja -->
  <polygon
    points="58,10 36,52 52,52 42,90 72,44 56,44 68,10"
    fill="#E65100"
  />
</svg>
```

---

## 7. Accesibilidad

| Elemento | Especificación |
|----------|---------------|
| Logo como imagen | `alt="Tramita logo"` |
| Logo como SVG inline | `role="img"` + `<title>Tramita</title>` |
| Contraste negro sobre fondo | 19.7:1 — pasa AAA |
| Contraste naranja sobre fondo claro | 3.4:1 — pasa AA para texto grande |
| Contraste naranja sobre negro | 5.2:1 — pasa AA |
| Tamaño mínimo clickable | 44×44px (WCAG 2.5.5) |

---

## 8. Assets disponibles

| Archivo | Formato | Uso |
|---------|---------|-----|
| `Tramita_brand.png` | PNG 300dpi | Brand sheet completo |
| `Tramita_icon.png` | PNG 1024×1024 | App icon |
| `Tramita_logo_final.png` | PNG 1600×460 | Logo horizontal |
| `Tramita_handoff.md` | Markdown | Este documento |

---

*AutomatizAI · Tramita® · 2026 — Todos los elementos de marca son propiedad de AutomatizAI.*
