import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Convierte el contenido de un SRT a WebVTT (que el navegador puede renderizar).
 */
function srtToVtt(srtContent) {
  if (!srtContent) return '';

  let vtt = 'WEBVTT\n\n';
  const blocks = srtContent.replace(/\r\n/g, '\n').trim().split('\n\n');

  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length < 2) continue;

    // Buscar la línea con el timestamp (puede ser la 1ª o la 2ª)
    const timeLineIndex = lines.findIndex((l) => l.includes('-->'));
    if (timeLineIndex === -1) continue;

    const timeLine = lines[timeLineIndex].replace(/,/g, '.');
    const text = lines.slice(timeLineIndex + 1).join('\n');
    vtt += `${timeLine}\n${text}\n\n`;
  }

  return vtt;
}

export default function VideoPreview({ videoFile, srtContent, style }) {
  const videoRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [trackUrl, setTrackUrl] = useState(null);

  // URL del video
  useEffect(() => {
    if (!videoFile) {
      setVideoUrl(null);
      return;
    }
    const url = URL.createObjectURL(videoFile);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  // URL del track VTT
  useEffect(() => {
    if (!srtContent) {
      setTrackUrl(null);
      return;
    }
    const vtt = srtToVtt(srtContent);
    const blob = new Blob([vtt], { type: 'text/vtt' });
    const url = URL.createObjectURL(blob);
    setTrackUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [srtContent]);

  // CSS dinámico para el ::cue del <track>
  const cueCss = useMemo(() => {
    if (!style) return '';
    const fontSize = Math.round((style.fontSize || 24) * 0.8);
    return `
      video::cue {
        font-family: Arial, sans-serif;
        font-size: ${fontSize}px;
        color: ${style.primaryColor || '#FFFFFF'};
        font-weight: ${style.bold ? 'bold' : 'normal'};
        background-color: rgba(0, 0, 0, 0);
        text-shadow:
          ${style.outline || 0}px 0 0 ${style.outlineColor || '#000000'},
          -${style.outline || 0}px 0 0 ${style.outlineColor || '#000000'},
          0 ${style.outline || 0}px 0 ${style.outlineColor || '#000000'},
          0 -${style.outline || 0}px 0 ${style.outlineColor || '#000000'},
          ${style.shadow || 0}px ${style.shadow || 0}px ${style.shadow || 0}px rgba(0,0,0,0.8);
        }
    `;
  }, [style]);

  // Inyectar el CSS dinámico en el head
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = cueCss;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, [cueCss]);

  // Activar los subtítulos por defecto
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !trackUrl) return;

    const enableSubs = () => {
      const track = video.textTracks?.[0];
      if (track) track.mode = 'showing';
    };

    if (video.readyState >= 1) enableSubs();
    video.addEventListener('loadedmetadata', enableSubs);
    return () => video.removeEventListener('loadedmetadata', enableSubs);
  }, [trackUrl]);

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Vista previa</h2>
        {videoFile && (
          <span className="text-xs text-slate-500">
            {srtContent
              ? '👁️ Subtítulos activados'
              : 'Sin subtítulos'}
          </span>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center p-4 bg-slate-900">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            playsInline
            className="max-w-full max-h-full rounded-lg shadow-lg"
          >
            {trackUrl && (
              <track
                kind="subtitles"
                src={trackUrl}
                srcLang="es"
                label="Subtítulos"
                default
              />
            )}
          </video>
        ) : (
          <div className="text-center space-y-3 py-16">
            <svg
              className="w-12 h-12 text-slate-600 mx-auto"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5l4.72-2.36A.75.75 0 0121.75 9v6a.75.75 0 01-1.28.86l-4.72-2.36m-9.5-3.75h9a1.5 1.5 0 011.5 1.5v6a1.5 1.5 0 01-1.5 1.5h-9a1.5 1.5 0 01-1.5-1.5v-6a1.5 1.5 0 011.5-1.5z"
              />
            </svg>
            <p className="text-sm text-slate-400">
              Sube un video para ver la vista previa
            </p>
          </div>
        )}
      </div>

      <div className="px-5 py-3 bg-white border-t border-slate-200 text-xs text-slate-400 text-center">
        💡 El estilo se aplica al video final, no a esta vista previa del navegador
      </div>
    </div>
  );
}