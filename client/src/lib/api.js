import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

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

/**
 * Descarga el SRT usando fetch para respetar el header Content-Disposition
 * (que lleva el nombre del archivo original del video).
 */
export async function downloadSRT(jobId) {
  try {
    const response = await api.get(`/transcribe/${jobId}/download`, {
      responseType: 'blob',
    });

    // Intentar extraer el nombre del header Content-Disposition
    let filename = 'subtitles.srt';
    const disposition = response.headers['content-disposition'];
    if (disposition) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) filename = match[1];
    }

    // Crear el blob y disparar la descarga
    const blob = new Blob([response.data], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error descargando SRT:', err);
    throw new Error('No se pudo descargar el archivo SRT');
  }
}