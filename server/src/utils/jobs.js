import { randomUUID } from 'node:crypto';

const jobs = new Map();
const TTL_MS = 1000 * 60 * 60 * 6;

export function createJob() {
  const id = randomUUID();
  jobs.set(id, {
    id,
    status: 'processing',
    progress: 0,
    srt: null,
    error: null,
    stage: 'En cola…',
    timeline: { extract: 'active' },
    segments: [],
    detectedLanguage: null,
    createdAt: Date.now(),
  });

  console.log(`[jobs] Creado job ${id}`);
  setTimeout(() => {
    console.log(`[jobs] Borrado job ${id} (TTL 6h)`);
    jobs.delete(id);
  }, TTL_MS);

  return id;
}

export function getJob(id) {
  return jobs.get(id);
}

export function updateJob(id, patch) {
  const job = jobs.get(id);
  if (!job) {
    console.warn(`[jobs] updateJob: job ${id} no existe`);
    return;
  }
  Object.assign(job, patch);
}

export function failJob(id, message) {
  console.error(`[jobs] Job ${id} falló: ${message}`);
  updateJob(id, { status: 'error', error: message, stage: '❌ Error' });
}