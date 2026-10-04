import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { extractAudio } from '../services/ffmpeg.js';
import { transcribeWithAssemblyAI } from '../services/assemblyai.js';
import { segmentsToSRT } from '../utils/srt.js';
import { createJob, getJob, updateJob, failJob } from '../utils/jobs.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

await fs.mkdir(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp4';
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 2048 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('video/')) cb(null, true);
    else cb(new Error('Solo se permiten archivos de video'));
  },
});

const router = Router();

function uploadVideo(req, res, next) {
  upload.single('video')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'El video es demasiado grande. Máximo 2 GB.' });
      }
      return res.status(400).json({ error: `Error de subida: ${err.message}` });
    }
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}

router.post('/', uploadVideo, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún video' });
  }

  const targetLang = req.body.targetLang || 'original';
  const videoPath = req.file.path;
  const originalName = req.file.originalname;
  const jobId = createJob();

  // Guardamos el nombre original del video para usarlo al descargar el SRT
  updateJob(jobId, { originalName });

  console.log(
    `[POST /transcribe] Job ${jobId}, video: ${originalName} (${(req.file.size / 1024 / 1024).toFixed(2)} MB)`,
  );

  res.json({ jobId });

  (async () => {
    let audioPath = null;
    try {
      updateJob(jobId, {
        progress: 10,
        stage: 'Extrayendo audio del video…',
        timeline: { extract: 'active' },
      });
      audioPath = await extractAudio(videoPath, UPLOAD_DIR);

      updateJob(jobId, {
        progress: 25,
        stage: 'Audio listo. Enviando a AssemblyAI…',
        timeline: { extract: 'done', upload: 'active' },
      });

      const result = await transcribeWithAssemblyAI(audioPath, {
        targetLang,
        onStage: (stage) => {
          console.log(`[job ${jobId}] ${stage}`);
          updateJob(jobId, {
            stage,
            timeline: { extract: 'done', upload: 'active', transcribe: 'active' },
          });
        },
      });

      const detectedLanguage = result.language;
      const finalSegments = result.segments;

      updateJob(jobId, {
        progress: 85,
        stage: `Idioma detectado: ${detectedLanguage}`,
        detectedLanguage,
        segments: finalSegments,
        timeline: {
          extract: 'done',
          upload: 'done',
          transcribe: 'done',
          translate: 'done',
          srt: 'active',
        },
      });

      updateJob(jobId, {
        progress: 95,
        stage: 'Generando archivo SRT…',
      });

      const srt = segmentsToSRT(finalSegments);

      updateJob(jobId, {
        status: 'done',
        progress: 100,
        srt,
        stage: '¡Listo!',
        timeline: {
          extract: 'done',
          upload: 'done',
          transcribe: 'done',
          translate: 'done',
          srt: 'done',
        },
      });

      console.log(`[job ${jobId}] ✅ COMPLETADO`);
    } catch (err) {
      console.error(`[job ${jobId}] ❌ ERROR:`, err);
      failJob(jobId, err.message || 'Error desconocido');
    } finally {
      fs.unlink(videoPath).catch(() => {});
      if (audioPath) fs.unlink(audioPath).catch(() => {});
    }
  })();
});

router.get('/:id', (req, res) => {
  const job = getJob(req.params.id);
  if (!job) {
    console.warn(`[GET /transcribe/${req.params.id}] ❌ Job no encontrado`);
    return res.status(404).json({ error: 'Job no encontrado' });
  }
  res.json({
    status: job.status,
    progress: job.progress,
    stage: job.stage,
    detectedLanguage: job.detectedLanguage,
    segments: job.segments,
    timeline: job.timeline,
    error: job.error,
  });
});

router.get('/:id/download', (req, res) => {
  const job = getJob(req.params.id);
  if (!job || job.status !== 'done' || !job.srt) {
    return res.status(404).json({ error: 'SRT no disponible' });
  }

  // Generar nombre de archivo basado en el video original
  let baseName = job.originalName || 'subtitles';
  baseName = baseName.replace(/\.[^/.]+$/, ''); // quita extensión (.mp4, .mkv...)
  baseName = baseName.replace(/[^\w\s.\-áéíóúÁÉÍÓÚñÑüÜ]/g, '').trim(); // limpia caracteres raros, permite acentos
  const filename = `${baseName}.srt`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(job.srt);
});

export default router;