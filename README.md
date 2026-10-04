# 🎬 Subtitle Forge Cloud

Genera archivos `.srt` desde cualquier video usando **IA en la nube (AssemblyAI)**. Rápido, sin instalar modelos, sin esperas.

## ✨ Features

- 🎥 Acepta cualquier video (MP4, MKV, MOV...) hasta 2 GB
- 🌐 Detección automática del idioma original
- 🌍 Traducción a 10+ idiomas (español, inglés, francés, japonés, chino, etc.)
- ⚡ Procesamiento en la nube — segundos o minutos, no horas
- 👀 Vista previa de subtítulos antes de descargar
- 📊 Progreso en tiempo real con timeline visual
- 📥 El SRT descargado conserva el nombre de tu video original

## 🏗️ Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS 3 |
| Backend | Node.js + Express 5 |
| Transcripción | [AssemblyAI](https://www.assemblyai.com) |
| Audio | FFmpeg (del sistema) |

## 📋 Requisitos

- Node.js >= 18 (recomendado 20)
- FFmpeg instalado en el sistema
- Una API key de [AssemblyAI](https://www.assemblyai.com/dashboard/signup) (gratis, incluye crédito)

## 🚀 Instalación

### 1. Clonar

```bash
git clone https://github.com/jhongonzalezs/subtitle-forge-cloud.git
cd subtitle-forge-cloud
```

### 2. Backend

```bash
cd server
npm install
cp .env.example .env
# Edita .env con tu ASSEMBLYAI_API_KEY
npm run dev
```

### 3. Frontend (otra terminal)

```bash
cd client
npm install
npm run dev
```

Abre http://localhost:3000

## 🎮 Uso

1. Arrastra un video
2. Elige el idioma de salida
3. Clic en "Generar subtítulos"
4. Espera unos segundos
5. Descarga tu `.srt` (con el mismo nombre que tu video)

## 💰 Costo

AssemblyAI cobra por minuto de audio. Su plan gratuito incluye crédito suficiente para **~185 horas de transcripción**.

## 📄 Licencia

MIT