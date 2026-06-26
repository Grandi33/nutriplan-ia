# 🥗 NutriPlan IA

Asistente de dieta personalizado con inteligencia artificial real (Claude / Anthropic).
Genera planes semanales, recetas, lista de la compra y tiene un nutricionista IA con chat en streaming.

Construido con **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion + Zustand + Recharts + Anthropic SDK**.

---

## ✨ Características

- **Onboarding multi-paso** con cálculo de IMC en tiempo real, validación y confeti al terminar.
- **Generación de plan semanal con IA** (pantalla de carga cinematográfica con partículas).
- **Vista del plan**: navegación por días, macros animadas, meal cards y modal de receta completa.
- **Recetas detalladas con IA** + alternativas ("¿No me apetece?") + añadir a la compra.
- **Lista de la compra**: por categorías, progreso, copiar, compartir por WhatsApp y estimación de precio.
- **Chat con nutricionista IA en streaming** (markdown, sugerencias, historial persistido).
- **Estadísticas**: donut de macros, barras de calorías, línea de proteína, platos destacados.
- **Historial** de hasta 10 planes con restaurar y comparar.
- **Exportar el plan a PDF** (html2canvas + jsPDF).
- **Modo oscuro/claro** con toggle animado, **responsive** y **PWA** (manifest + iconos).

---

## 🚀 Puesta en marcha

> Requisitos: **Node.js 18.17+** (recomendado 20 LTS) y npm.

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Configura tu clave de Anthropic. Edita el archivo **`.env.local`** (ya existe) y pega tu clave:

   ```bash
   ANTHROPIC_API_KEY=sk-ant-tu-clave-real
   ```

   La consigues en https://console.anthropic.com/

3. Arranca el servidor de desarrollo:

   ```bash
   npm run dev
   ```

4. Abre **http://localhost:3000** 🎉

### Comprobar tipos / compilar

```bash
npm run typecheck   # tsc --noEmit
npm run build       # build de producción
```

---

## 🗂️ Estructura

```
nutriplan/
├── app/                # rutas (App Router) + API routes
│   ├── api/            # generate-plan, chat (streaming), recipe, alternatives, analyze-day
│   ├── onboarding/ plan/ plan/[dia]/ compra/ chat/ historial/ settings/
├── components/         # ui, layout, plan, chat, charts, compra, common, onboarding
├── hooks/              # useProfile, usePlan, useChat
└── lib/                # types, anthropic, store (Zustand), storage, calculations, pdf-export, utils, constants
```

## 🔐 Datos

Todo se guarda en `localStorage` del navegador (perfil, plan activo, historial, chat, estado de la compra y tema).
La clave de la API **solo** se usa en el servidor (API routes); nunca se expone al cliente.

## 🧠 Modelo

Usa `claude-opus-4-8` para generar planes, recetas, alternativas, análisis y el chat.
