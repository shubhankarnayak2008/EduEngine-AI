import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ApiKeyModal from './components/ApiKeyModal';

// Tab components
import ChatbotTab from './components/tabs/ChatbotTab';
import YoutubeHubTab from './components/tabs/YoutubeHubTab';
import QuizFlashcardTab from './components/tabs/QuizFlashcardTab';
import NotesSummarizerTab from './components/tabs/NotesSummarizerTab';
import RoadmapPlannerTab from './components/tabs/RoadmapPlannerTab';
import CodeDebuggerTab from './components/tabs/CodeDebuggerTab';
import PomodoroTab from './components/tabs/PomodoroTab';
import LabResumeTab from './components/tabs/LabResumeTab';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return true; // Default sleek dark mode
  });

  // Navigation state
  const [activeTab, setActiveTab] = useState('chatbot');
  const [selectedBranch, setSelectedBranch] = useState('CSE');
  const [selectedSemester, setSelectedSemester] = useState(4); // Sem 4 has rich core subjects (OS, DBMS, DAA)

  // Modals & Drawers
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [demoToast, setDemoToast] = useState(null);

  // Sync theme with html root class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Seamless transfer from other tabs into the AI Study Chatbot
  const handleTransferToChat = (promptText) => {
    setActiveTab('chatbot');
    setDemoToast(`Transferred question to AI Study Chatbot!`);
    setTimeout(() => setDemoToast(null), 3000);

    // Save prompt to trigger automatically in Chatbot
    setTimeout(() => {
      const chatInput = document.querySelector('textarea[placeholder*="Ask any B.Tech question"]');
      if (chatInput) {
        chatInput.value = promptText;
        chatInput.dispatchEvent(new Event('input', { bubbles: true }));
        chatInput.focus();
      }
    }, 150);
  };

  // Showcase Demo Mode
  const handleTriggerDemo = () => {
    setDemoToast(`Loaded B.Tech Academic Showcase Demo!`);
    setTimeout(() => setDemoToast(null), 3500);
    setActiveTab('chatbot');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        selectedSemester={selectedSemester}
        setSelectedSemester={setSelectedSemester}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onTriggerDemo={handleTriggerDemo}
      />

      {/* Main Body: Sidebar + Dynamic Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          selectedBranch={selectedBranch}
          selectedSemester={selectedSemester}
        />

        {/* Dynamic Tab Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeTab === 'chatbot' && (
            <ChatbotTab
              selectedBranch={selectedBranch}
              selectedSemester={selectedSemester}
              onTriggerApiKey={() => setIsApiKeyModalOpen(true)}
            />
          )}

          {activeTab === 'youtube' && (
            <YoutubeHubTab
              selectedBranch={selectedBranch}
              setSelectedBranch={setSelectedBranch}
              selectedSemester={selectedSemester}
              setSelectedSemester={setSelectedSemester}
              onAskTutorAboutTopic={handleTransferToChat}
            />
          )}

          {activeTab === 'quiz' && (
            <QuizFlashcardTab
              selectedBranch={selectedBranch}
              selectedSemester={selectedSemester}
            />
          )}

          {activeTab === 'summarizer' && (
            <NotesSummarizerTab
              onTransferToChat={handleTransferToChat}
            />
          )}

          {activeTab === 'roadmap' && (
            <RoadmapPlannerTab
              selectedSemester={selectedSemester}
              setSelectedSemester={setSelectedSemester}
              onAskTutorAboutTopic={handleTransferToChat}
            />
          )}

          {activeTab === 'debugger' && (
            <CodeDebuggerTab
              onAskInChat={handleTransferToChat}
            />
          )}

          {activeTab === 'pomodoro' && (
            <PomodoroTab />
          )}

          {activeTab === 'lab' && (
            <LabResumeTab
              onAskInChat={handleTransferToChat}
            />
          )}
        </main>
      </div>

      {/* API Key Settings Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeyUpdated={(newModel) => {
          setDemoToast(`Gemini model configuration updated (${newModel})`);
          setTimeout(() => setDemoToast(null), 3000);
        }}
      />

      {/* Demo / Notification Toast */}
      {demoToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-xl animate-slide-up flex items-center gap-2">
          <span>✨</span>
          <span>{demoToast}</span>
        </div>
      )}
    </div>
  );
}
