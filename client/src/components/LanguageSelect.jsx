const LANGUAGES = [
  { code: 'original', name: '🌐 Idioma original' },
  { code: 'en', name: '🇬🇧 English' },
  { code: 'es', name: '🇪🇸 Español' },
  { code: 'fr', name: '🇫🇷 Français' },
  { code: 'de', name: '🇩🇪 Deutsch' },
  { code: 'it', name: '🇮🇹 Italiano' },
  { code: 'pt', name: '🇵🇹 Português' },
  { code: 'ja', name: '🇯🇵 日本語' },
  { code: 'zh', name: '🇨🇳 中文' },
  { code: 'ru', name: '🇷🇺 Русский' },
];

export default function LanguageSelect({ value, onChange }) {
  return (
    <div className="space-y-1">
      <label
        htmlFor="lang"
        className="block text-sm font-medium text-slate-700"
      >
        Idioma de salida
      </label>
      <select
        id="lang"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.name}
          </option>
        ))}
      </select>
      <p className="text-xs text-slate-400 pt-1">
        AssemblyAI transcribe y traduce al idioma que elijas.
      </p>
    </div>
  );
}