import ffmpeg from 'fluent-ffmpeg';
import path from 'node:path';
import fs from 'node:fs/promises';

export function burnSubtitles(videoPath, srtPath, outputPath, style = {}, onProgress) {
  return new Promise((resolve, reject) => {
    const forceStyle = buildForceStyle(style);

    const escapedSrtPath = srtPath
      .replace(/\\/g, '/')
      .replace(/:/g, '\\:')
      .replace(/'/g, "'\\''");

    const subtitleFilter = forceStyle
      ? `subtitles='${escapedSrtPath}':force_style='${forceStyle}'`
      : `subtitles='${escapedSrtPath}'`;

    let lastLogTime = 0;

    ffmpeg(videoPath)
      .videoFilters(subtitleFilter)
      .outputOptions([
        '-c:v libx264',
        '-crf 20',
        '-preset fast',
        '-c:a copy',
        '-movflags +faststart',
      ])
      .on('start', (cmd) => {
        console.log('[burn] 🚀 FFmpeg iniciado');
        console.log('[burn] Comando:', cmd.slice(0, 500));
      })
      .on('codecData', (data) => {
        console.log(`[burn] ⏱️  Duración total: ${data.duration}`);
        console.log(`[burn] 🎞️  Video: ${data.video}`);
        console.log(`[burn] 🔊 Audio: ${data.audio}`);
      })
      .on('progress', (progress) => {
        const pct = Math.min(100, Math.round(progress.percent || 0));

        const now = Date.now();
        if (now - lastLogTime > 3000) {
          const timemark = progress.timemark || '00:00:00';
          const speed = progress.currentFps
            ? ` (${Math.round(progress.currentFps)} fps)`
            : '';
          console.log(
            `[burn] 📊 Progreso: ${pct}% — procesado hasta ${timemark}${speed}`,
          );
          lastLogTime = now;
        }

        if (onProgress) onProgress(20 + pct * 0.75);
      })
      .on('end', () => {
        console.log('[burn] ✅ Video generado:', outputPath);
        resolve();
      })
      .on('error', (err, stderr) => {
        console.error('[burn] ❌ Error:', err.message);
        if (stderr) console.error('[burn] stderr:', stderr.slice(-500));
        reject(new Error(`FFmpeg falló: ${err.message}`));
      })
      .save(outputPath);
  });
}

function buildForceStyle(style = {}) {
  const params = [];

  if (style.fontSize) params.push(`FontSize=${style.fontSize}`);
  if (style.fontName) params.push(`FontName=${style.fontName}`);
  if (style.primaryColor) params.push(`PrimaryColour=${rgbToAss(style.primaryColor)}`);
  if (style.outlineColor) params.push(`OutlineColour=${rgbToAss(style.outlineColor)}`);
  if (style.backColor) params.push(`BackColour=${rgbToAss(style.backColor)}`);
  if (style.outline !== undefined) params.push(`Outline=${style.outline}`);
  if (style.shadow !== undefined) params.push(`Shadow=${style.shadow}`);
  if (style.borderStyle !== undefined) params.push(`BorderStyle=${style.borderStyle}`);
  if (style.alignment !== undefined) params.push(`Alignment=${style.alignment}`);
  if (style.marginV !== undefined) params.push(`MarginV=${style.marginV}`);
  if (style.bold !== undefined) params.push(`Bold=${style.bold ? 1 : 0}`);

  return params.join(',');
}

function rgbToAss(color) {
  if (!color) return '&H00FFFFFF';

  const hexMatch = color.match(/^#?([0-9a-fA-F]{6})$/);
  if (hexMatch) {
    const hex = hexMatch[1];
    const r = hex.substring(0, 2);
    const g = hex.substring(2, 4);
    const b = hex.substring(4, 6);
    return `&H00${b}${g}${r}`.toUpperCase();
  }

  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbaMatch) {
    const [, r, g, b] = rgbaMatch;
    const toHex = (n) => parseInt(n, 10).toString(16).padStart(2, '0');
    return `&H00${toHex(b)}${toHex(g)}${toHex(r)}`.toUpperCase();
  }

  return `&H00FFFFFF`;
}