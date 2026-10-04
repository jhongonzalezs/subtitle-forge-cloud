export default function StyleControls({ style, onChange }) {
  const update = (key, value) => {
    onChange({ ...style, [key]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        🎨 Estilo de subtítulos
      </h3>

      {/* Tamaño */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-medium text-slate-600">
          <label htmlFor="fontSize">Tamaño</label>
          <span className="font-mono text-brand-600">{style.fontSize}px</span>
        </div>
        <input
          id="fontSize"
          type="range"
          min="12"
          max="72"
          step="2"
          value={style.fontSize}
          onChange={(e) => update('fontSize', parseInt(e.target.value, 10))}
          className="w-full accent-brand-600"
        />
      </div>

      {/* Margen vertical */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-medium text-slate-600">
          <label htmlFor="marginV">Posición vertical</label>
          <span className="font-mono text-brand-600">{style.marginV}px</span>
        </div>
        <input
          id="marginV"
          type="range"
          min="0"
          max="200"
          step="5"
          value={style.marginV}
          onChange={(e) => update('marginV', parseInt(e.target.value, 10))}
          className="w-full accent-brand-600"
        />
      </div>

      {/* Color del texto */}
      <div className="space-y-1.5">
        <label
          htmlFor="primaryColor"
          className="block text-xs font-medium text-slate-600"
        >
          Color del texto
        </label>
        <div className="flex items-center gap-2">
          <input
            id="primaryColor"
            type="color"
            value={style.primaryColor}
            onChange={(e) => update('primaryColor', e.target.value)}
            className="w-10 h-10 rounded cursor-pointer border border-slate-300"
          />
          <input
            type="text"
            value={style.primaryColor}
            onChange={(e) => update('primaryColor', e.target.value)}
            className="flex-1 px-2 py-1.5 rounded border border-slate-300 text-xs font-mono"
          />
          <div className="flex gap-1">
            {['#FFFFFF', '#FFFF00', '#00FFFF', '#FF00FF'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => update('primaryColor', c)}
                className="w-6 h-6 rounded border border-slate-300 hover:scale-110 transition-transform"
                style={{ backgroundColor: c }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Borde / contorno */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-medium text-slate-600">
          <label htmlFor="outline">Contorno</label>
          <span className="font-mono text-brand-600">{style.outline}px</span>
        </div>
        <input
          id="outline"
          type="range"
          min="0"
          max="6"
          step="0.5"
          value={style.outline}
          onChange={(e) => update('outline', parseFloat(e.target.value))}
          className="w-full accent-brand-600"
        />
      </div>

      {/* Color del borde */}
      <div className="space-y-1.5">
        <label
          htmlFor="outlineColor"
          className="block text-xs font-medium text-slate-600"
        >
          Color del contorno
        </label>
        <div className="flex items-center gap-2">
          <input
            id="outlineColor"
            type="color"
            value={style.outlineColor}
            onChange={(e) => update('outlineColor', e.target.value)}
            className="w-10 h-10 rounded cursor-pointer border border-slate-300"
          />
          <input
            type="text"
            value={style.outlineColor}
            onChange={(e) => update('outlineColor', e.target.value)}
            className="flex-1 px-2 py-1.5 rounded border border-slate-300 text-xs font-mono"
          />
        </div>
      </div>

      {/* Sombra */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-medium text-slate-600">
          <label htmlFor="shadow">Sombra</label>
          <span className="font-mono text-brand-600">{style.shadow}px</span>
        </div>
        <input
          id="shadow"
          type="range"
          min="0"
          max="6"
          step="0.5"
          value={style.shadow}
          onChange={(e) => update('shadow', parseFloat(e.target.value))}
          className="w-full accent-brand-600"
        />
      </div>

      {/* Negrita */}
      <div className="flex items-center justify-between">
        <label htmlFor="bold" className="text-xs font-medium text-slate-600">
          Negrita
        </label>
        <input
          id="bold"
          type="checkbox"
          checked={style.bold}
          onChange={(e) => update('bold', e.target.checked)}
          className="w-4 h-4 accent-brand-600"
        />
      </div>

      {/* Alineación */}
      <div className="space-y-1.5">
        <label
          htmlFor="alignment"
          className="block text-xs font-medium text-slate-600"
        >
          Posición
        </label>
        <select
          id="alignment"
          value={style.alignment}
          onChange={(e) => update('alignment', parseInt(e.target.value, 10))}
          className="w-full px-2 py-1.5 rounded border border-slate-300 text-xs bg-white"
        >
          <option value={1}>Abajo izquierda</option>
          <option value={2}>Abajo centro</option>
          <option value={3}>Abajo derecha</option>
          <option value={4}>Medio izquierda</option>
          <option value={5}>Medio centro</option>
          <option value={6}>Medio derecha</option>
          <option value={7}>Arriba izquierda</option>
          <option value={8}>Arriba centro</option>
          <option value={9}>Arriba derecha</option>
        </select>
      </div>

      {/* Reset */}
      <button
        type="button"
        onClick={() =>
          onChange({
            fontSize: 24,
            fontName: 'Arial',
            primaryColor: '#FFFFFF',
            outlineColor: '#000000',
            outline: 2,
            shadow: 1,
            bold: false,
            alignment: 2,
            marginV: 30,
          })
        }
        className="w-full py-2 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
      >
        ↺ Restablecer valores
      </button>
    </div>
  );
}