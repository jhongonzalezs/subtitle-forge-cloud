import { useRef, useState } from 'react';

export default function SrtUploader({ srtFile, onSrtFile, srtText, onSrtText }) {
  const [mode, setMode] = useState('file'); // 'file' | 'paste'
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.srt')) {
      alert('Solo se aceptan archivos .srt');
      return;
    }
    onSrtFile(file);
    onSrtText(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleClear = () => {
    onSrtFile(null);
    onSrtText(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const hasContent = srtFile || (srtText && srtText.trim().length > 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">
          Archivo de subtítulos
        </label>
        <div className="inline-flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
          <button
            type="button"
            onClick={() => setMode('file')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              mode === 'file'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Subir archivo
          </button>
          <button
            type="button"
            onClick={() => setMode('paste')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              mode === 'paste'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Pegar texto
          </button>
        </div>
      </div>

      {mode === 'file' && (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`
            flex flex-col items-center justify-center gap-2
            w-full h-32 rounded-2xl border-2 border-dashed cursor-pointer
            transition-all duration-200
            ${
              dragging
                ? 'border-brand-500 bg-brand-50 scale-[1.01]'
                : srtFile
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-slate-300 bg-white hover:border-brand-500 hover:bg-slate-50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".srt"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          {srtFile ? (
            <>
              <svg
                className="w-8 h-8 text-emerald-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-center px-4">
                <p className="text-sm font-medium text-emerald-700 break-all">
                  {srtFile.name}
                </p>
                <p className="text-xs text-emerald-600 mt-0.5">
                  {(srtFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </>
          ) : (
            <>
              <svg
                className="w-8 h-8 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-700">
                  Arrastra tu archivo .srt aquí
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  o haz clic para seleccionar
                </p>
              </div>
            </>
          )}
        </label>
      )}

      {mode === 'paste' && (
        <textarea
          value={srtText || ''}
          onChange={(e) => {
            onSrtText(e.target.value);
            onSrtFile(null);
          }}
          placeholder={`1
00:00:00,000 --> 00:00:03,000
Hola mundo

2
00:00:03,000 --> 00:00:06,000
Subtítulos de prueba`}
          rows={8}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs font-mono focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition resize-y"
        />
      )}

      {hasContent && (
        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-slate-400 hover:text-red-500 transition-colors"
        >
          ✕ Quitar subtítulos
        </button>
      )}
    </div>
  );
}