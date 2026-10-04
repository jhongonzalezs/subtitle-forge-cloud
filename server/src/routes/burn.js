import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { burnSubtitles } from '../services/burn.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');
const OUTPUT_DIR = path.resolve(__dirname, '../../outputs');

await fs.mkdir(UPLOAD_DIR, { recursive: true });
await fs.mkdir(OUTPUT_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.bin';
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 2048 },
}).fields([
  { name: 'video', maxCount: 1 },
  { name: 'srt', maxCount: 1 },
]);

const router = Router();

router.post('/', (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Error de subida: ${err.message}` });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const videoFile = req.files?.video?.[0];
    const srtFile = req.files?.srt?.[0];

    if (!videoFile) {
      return res.status(400).json({ error: 'No se recibió ningún video' });
    }

    let srtPath = null;
    let outputPath = null;

    try {
      let style = {};
      if (req.body.style) {
        try {
          style = JSON.parse(req.body.style);
        } catch {
          console.warn('[burn] style no es JSON válido');
        }
      }

      if (srtFile) {
        srtPath = srtFile.path;
      } else if (req.body.srtText) {
        srtPath = path.join(UPLOAD_DIR, `${Date.now()}-subs.srt`);
        await fs.writeFile(srtPath, req.body.srtText, 'utf8');
      } else {
        return res.status(400).json({ error: 'Falta el archivo SRT o el texto SRT' });
      }

      const baseName = path.basename(
        videoFile.originalname,
        path.extname(videoFile.originalname),
      );
      const cleanBase = baseName.replace(/[^\w\s.\-áéíóúÁÉÍÓÚñÑüÜ]/g, '').trim() || 'video';
      const outputName = `${cleanBase}-subtitled.mp4`;
      outputPath = path.join(OUTPUT_DIR, `${Date.now()}-${outputName}`);

      console.log(`[burn] Procesando: ${videoFile.originalname} (${(videoFile.size / 1024 / 1024).toFixed(2)} MB)`);
      console.log(`[burn] Estilo:`, style);

      await burnSubtitles(videoFile.path, srtPath, outputPath, style);

      console.log(`[burn] ✅ Listo: ${outputPath}`);

      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', `attachment; filename="${outputName}"`);

      const stream = (await import('node:fs')).createReadStream(outputPath);
      stream.pipe(res);

      stream.on('end', async () => {
        await fs.unlink(videoFile.path).catch(() => {});
        if (srtFile) await fs.unlink(srtFile.path).catch(() => {});
        else if (srtPath) await fs.unlink(srtPath).catch(() => {});
        await fs.unlink(outputPath).catch(() => {});
      });

      stream.on('error', (err) => {
        console.error('[burn] Error en stream:', err);
      });
    } catch (error) {
      console.error('[burn] ❌ Error:', error);
      if (videoFile) await fs.unlink(videoFile.path).catch(() => {});
      if (srtFile) await fs.unlink(srtFile.path).catch(() => {});
      if (outputPath) await fs.unlink(outputPath).catch(() => {});

      if (!res.headersSent) {
        res.status(500).json({ error: error.message || 'Error al quemar subtítulos' });
      }
    }
  });
});

export default router;