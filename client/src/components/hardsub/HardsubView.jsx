import { useEffect, useState } from 'react';
import UploadZone from '../UploadZone';
import SrtUploader from './SrtUploader';
import StyleControls from './StyleControls';
import VideoPreview from './VideoPreview';
import { burnVideo, downloadBlob } from '../../lib/api';

const DEFAULT_STYLE = {
  fontSize: 24,
  fontName: 'Arial',
  primaryColor: '#FFFFFF',
  outlineColor: '#000000',
  outline: 2,
  shadow: 1,
  bold: false,
  alignment: 2,
  marginV: 30,
};

export default function HardsubView() {
  const [videoFile, setVideoFile] = useState(null);
  const [srtFile, setSrtFile] = useState(null);
  const [srtText, setSrtText] = useState(null);
  const [srtContent, setSrtContent] = useState(null);
  const [style, setStyle] = useState(DEFAULT_STYLE);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const canRender =
    videoFile && (srtFile || (srtText && srtText.trim().length > 0));

  // Cargar el contenido del SRT para la preview
  useEffect(() => {
    if (srtFile) {
      const reader = new FileReader();
      reader.onload = (e) => setSrtContent(e.target.result);
      reader.readAsText(srtFile);
    } else if (srtText) {
      setSrtContent(srtText);
    } else {
      setSrtContent(null);
    }
  }, [srtFile, srtText]);

  const handleBurn = async () => {
    if (!canRender || loading) return;

    setLoading(true);
    setError(null);
    setDone(false);
    setProgress(0);

    try {
      const { blob, filename } = await burnVideo(
        videoFile,
        srtFile,
        srtText,
        style,
        setProgress,
      );

      downloadBlob(blob, filename);
      setDone(true);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al quemar subtítulos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Columna izquierda: controles */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-6 space-y-5 border border-slate-100">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Video
            </label>
            <UploadZone file={videoFile} onFile={setVideoFile} />
          </div>

          <SrtUploader
            srtFile={srtFile}
            onSrtFile={setSrtFile}
            srtText={srtText}
            onSrtText={setSrtText}
          />

          <StyleControls style={style} onChange={setStyle} />

          <button
            onClick={handleBurn}
            disabled={!canRender || loading}
            className="w-full py-3 rounded-xl font-medium text-white bg-brand-600 hover:bg-brand-700 active:scale-[0.99] disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-150 shadow-sm hover:shadow-md"
          >
            {loading ? 'Procesando…' : '🔥 Quemar subtítulos'}
          </button>

          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-slate-600">
                <span>Renderizando…</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {done && !loading && (
            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
              ✅ Video con subtítulos descargado
            </div>
          )}

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              ⚠️ {error}
            </div>
          )}

          {!canRender && (
            <p className="text-xs text-slate-400 text-center">
              Sube un video y un archivo .srt para empezar
            </p>
          )}
        </div>
      </div>

      {/* Columna derecha: preview */}
      <div className="lg:col-span-3 min-h-[500px]">
        <VideoPreview
          videoFile={videoFile}
          srtContent={srtContent}
          style={style}
        />
      </div>
    </div>
  );
}