const TABS = [
  { id: 'transcribe', label: 'Transcribir', icon: '🎬' },
  { id: 'hardsub', label: 'Quemar subtítulos', icon: '🔥' },
];

export default function Header({ activeTab, onTabChange }) {
  return (
    <header className="text-center space-y-4">
      <div className="space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-600 text-white shadow-md">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 10.5l4.72-2.36A.75.75 0 0121.75 9v6a.75.75 0 01-1.28.86l-4.72-2.36m-9.5-3.75h9a1.5 1.5 0 011.5 1.5v6a1.5 1.5 0 01-1.5 1.5h-9a1.5 1.5 0 01-1.5-1.5v-6a1.5 1.5 0 011.5-1.5z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Subtitle Forge <span className="text-brand-600">Cloud</span>
        </h1>
        <p className="text-sm text-slate-500">
          Genera y quema subtítulos en tus videos con IA
        </p>
      </div>

      {/* Tabs */}
      <div className="inline-flex bg-slate-100 rounded-xl p-1 gap-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                px-5 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  isActive
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }
              `}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}