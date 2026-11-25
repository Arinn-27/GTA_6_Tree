import { useState } from 'react';
import { BranchTreeTab } from './components/BranchTreeTab';
import { EndingNavTab } from './components/EndingNavTab';
import { Footer } from './components/Footer';
import { GuideSection } from './components/GuideSection';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { SaveTrackerTab } from './components/SaveTrackerTab';
import { SyncModal } from './components/SyncModal';
import { ENDINGS, getEndingById } from './data/endings';
import { SAVE_SLOTS } from './data/saveSlots';
import { usePersistedState } from './hooks/usePersistedState';
import type { AppTab, EndingId, EndingSimulationInput } from './types/tracker';

const INITIAL_SIMULATOR_INPUT: EndingSimulationInput = {
  route: 'route-a',
  profile: 'clean',
  savings: '2m-plus',
  step2: 'shoot',
  step3: 'swim',
  step4: 'exit',
};

export function App() {
  const {
    state,
    toggleSlot,
    toggleEnding,
    setCurrentChapter,
    replaceState,
    resetState,
  } = usePersistedState();

  const [activeTab, setActiveTab] = useState<AppTab>('save-tracker');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('slot-8');
  const [simulatorInput, setSimulatorInput] = useState<EndingSimulationInput>(
    INITIAL_SIMULATOR_INPUT
  );
  const [syncOpen, setSyncOpen] = useState(false);

  const handleViewSlotInTree = (slotId: string) => {
    setSelectedNodeId(slotId);
    setActiveTab('branch-tree');
    const el = document.getElementById('workspace-root');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleInspectEnding = (endingId: EndingId) => {
    const ending = getEndingById(endingId);
    setSimulatorInput({ ...ending.presetInput });
    setActiveTab('ending-nav');
    const el = document.getElementById('workspace-root');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="site-ambient-bg flex min-h-screen flex-col bg-canvas text-slate-100">
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        checkedSlotsCount={state.checkedSlots.length}
        totalCheckpoints={SAVE_SLOTS.length}
        completedEndingsCount={state.completedEndings.length}
        totalEndings={ENDINGS.length}
        onOpenSync={() => setSyncOpen(true)}
      />

      <HeroBanner
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        checkedSlotsCount={state.checkedSlots.length}
        totalCheckpoints={SAVE_SLOTS.length}
        completedEndingsCount={state.completedEndings.length}
        totalEndings={ENDINGS.length}
        currentChapter={state.currentChapter}
      />

      <main
        id="workspace-root"
        className="mx-auto w-full max-w-6xl flex-1 scroll-mt-20 px-4 py-8 sm:px-6 sm:py-10"
      >
        {activeTab === 'save-tracker' && (
          <SaveTrackerTab
            checkedSlots={state.checkedSlots}
            currentChapter={state.currentChapter}
            onToggleSlot={toggleSlot}
            onChangeChapter={setCurrentChapter}
            onViewInTree={handleViewSlotInTree}
          />
        )}

        {activeTab === 'branch-tree' && (
          <BranchTreeTab
            checkedSlots={state.checkedSlots}
            completedEndings={state.completedEndings}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onToggleSlot={toggleSlot}
            onInspectEnding={handleInspectEnding}
          />
        )}

        {activeTab === 'ending-nav' && (
          <EndingNavTab
            completedEndings={state.completedEndings}
            onToggleEnding={toggleEnding}
            simulatorInput={simulatorInput}
            onChangeSimulatorInput={setSimulatorInput}
            onViewSlotInTree={handleViewSlotInTree}
          />
        )}

        <GuideSection />
      </main>

      <Footer
        onSelectTab={setActiveTab}
        onOpenSync={() => setSyncOpen(true)}
      />

      <SyncModal
        open={syncOpen}
        onClose={() => setSyncOpen(false)}
        state={state}
        onImportState={replaceState}
        onResetState={resetState}
      />
    </div>
  );
}

export default App;
