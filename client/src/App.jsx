import { useState } from 'react';
import Header from './components/Header';
import TranscribeView from './components/transcribe/TranscribeView';
import HardsubView from './components/hardsub/HardsubView';

export default function App() {
  const [activeTab, setActiveTab] = useState('transcribe');

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="max-w-xl mx-auto">
          <Header activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {activeTab === 'transcribe' && <TranscribeView />}
        {activeTab === 'hardsub' && <HardsubView />}
      </div>
    </main>
  );
}