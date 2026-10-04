import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

/* ═══════════════════════════════════════════════════════
   TRANSCRIBE (AssemblyAI)
   ═══════════════════════════════════════════════════════ */

export async function startTranscription(file, targetLang, onUploadProgress) {
  const formData = new FormData();
  formData.append('video', file);
  formData.append('targetLang', targetLang);

  try {
    const { data } = await api.post('/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onUploadProgress && e.total) {
          onUploadProgress(Math.round((e.loaded / e.total) * 40));
        }
      },
    });
    return data;
  } catch (err) {
    const msg =
      err.response?.data?.error ||
      err.message ||
      'Error desconocido al subir el video';
    throw new Error(msg);
  }
}

export async function getJobStatus(jobId) {
  try {
    const { data } = await api.get(`/transcribe/${jobId}`);
    return data;
  } catch (err) {
    if (err.response?.status === 404) {
      throw new Error(
        'El trabajo se perdió. Probablemente el backend se reinició. Intenta de nuevo.',
      );
    }
    throw err;
  }
}

export async function downloadSRT(jobId) {
  try {
    const response = await api.get(`/transcribe/${jobId}/download`, {
      responseType: 'blob',
    });

    let filename = 'subtitles.srt';
    const disposition = response.headers['content-disposition'];
    if (disposition) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) filename = match[1];
    }

    downloadBlob(response.data, filename);
  } catch (err) {
    console.error('Error descargando SRT:', err);
    throw new Error('No se pudo descargar el archivo SRT');
  }
}

/* ═══════════════════════════════════════════════════════
   BURN (FFmpeg hardsub)
   ═══════════════════════════════════════════════════════ */

export async function burnVideo(
  videoFile,
  srtFile,
  srtText,
  style,
  onProgress,
) {
  const formData = new FormData();
  formData.append('video', videoFile);

  if (srtFile) {
    formData.append('srt', srtFile);
  } else if (srtText) {
    formData.append('srtText', srtText);
  } else {
    throw new Error('Falta el archivo SRT');
  }

  formData.append('style', JSON.stringify(style));

  try {
    const response = await api.post('/burn', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob',
      timeout: 30 * 60 * 1000, // 30 min
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          // Upload cuenta como 0-20%, luego FFmpeg procesa (20-100)
          onProgress(Math.round((e.loaded / e.total) * 20));
        }
      },
    });

    // Extraer nombre del header
    let filename = 'video-subtitled.mp4';
    const disposition = response.headers['content-disposition'];
    if (disposition) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) filename = match[1];
    }

    return { blob: response.data, filename };
  } catch (err) {
    console.error('Error en burn:', err);
    // El error puede venir como blob (porque responseType: 'blob')
    let msg = 'Error al quemar subtítulos';
    if (err.response?.data instanceof Blob) {
      try {
        const text = await err.response.data.text();
        const parsed = JSON.parse(text);
        msg = parsed.error || msg;
      } catch {
        // no se pudo parsear
      }
    } else if (err.response?.data?.error) {
      msg = err.response.data.error;
    } else if (err.message) {
      msg = err.message;
    }
    throw new Error(msg);
  }
}

/* ═══════════════════════════════════════════════════════
   UTIL: descargar un blob
   ═══════════════════════════════════════════════════════ */

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}