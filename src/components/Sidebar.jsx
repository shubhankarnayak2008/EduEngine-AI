import React from 'react';
import { 
  Bot, 
  Youtube, 
  HelpCircle, 
  FileText, 
  Compass, 
  Bug, 
  Clock, 
  Briefcase, 
  X, 
  Flame, 
  Sparkles,
  ChevronRight,
  GraduationCap
} from 'lucide-react';

export const NAVIGATION_TABS = [
  {
    id: 'chatbot',
    label: 'AI Study Chatbot',
    badge: 'Gemini 1.5',
    icon: Bot,
    color: 'from-blue-500 to-indigo-600',
    description: 'B.Tech tutor for DSA, OS, DBMS & coding'
  },
  {
    id: 'youtube',
    label: 'YouTube Lecture Hub',
    badge: 'Curated',
    icon: Youtube,
    color: 'from-red-500 to-pink-600',
    description: 'Subject video playlists with synchronized notes'
  },
  {
    id: 'quiz',
    label: 'AI Quiz & Flashcards',
    badge: 'Interactive',
    icon: HelpCircle,
    color: 'from-amber-500 to-orange-600',
    description: 'Instant 10-MCQ quizzes with 3D flipcards'
  },
  {
    id: 'summarizer',
    label: 'Notes Summarizer',
    badge: 'AI Docs',
    icon: FileText,
    color: 'from-emerald-500 to-teal-600',
    description: 'Bullet summaries, formulas & exam questions'
  },
  {
    id: 'roadmap',
    label: 'Semester & Career Map',
    badge: 'Tracker',
    icon: Compass,
    color: 'from-purple-500 to-indigo-600',
    description: 'Sem 1-8 checklist, CGPA calculator & SDE tracks'
  },
  {
    id: 'debugger',
    label: 'Code & Bug Debugger',
    badge: 'Multi-Lang',
    icon: Bug,
    color: 'from-rose-500 to-red-600',
    description: 'C++, Python, Java & SQL fixer with Big-O'
  },
  {
    id: 'pomodoro',
    label: 'Pomodoro & Focus Audio',
    badge: 'WebAudio',
    icon: Clock,
    color: 'from-cyan-500 to-blue-600',
    description: 'Interval timer with offline ambient rain & lo-fi'
  },
  {
    id: 'lab',
    label: 'Lab & Placement Helper',
    badge: 'Career',
    icon: Briefcase,
    color: 'from-violet-500 to-purple-600',
    description: 'Lab records, viva questions & ATS resume optimizer'
  }
];

export default function Sidebar({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  selectedBranch,
  selectedSemester
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed md:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-72 
        bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 
        flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Navigation List */}
        <div className="p-4 space-y-1.5 overflow-y-auto">
          {/* Mobile Header in Drawer */}
          <div className="flex md:hidden items-center justify-between pb-3 mb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                {selectedBranch} · Sem {selectedSemester}
              </span>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            B.Tech Academic Suite
          </div>

          {NAVIGATION_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  onClose();
                }}
                className={`
                  w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs font-semibold
                  transition-all group relative
                  ${isActive 
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 shadow-sm border border-indigo-200/60 dark:border-indigo-800/60' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'}
                `}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105
                    ${isActive 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}
                  `}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="truncate leading-tight">{tab.label}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal truncate">
                      {tab.badge}
                    </div>
                  </div>
                </div>

                {isActive ? (
                  <span className="w-1.5 h-6 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            );
          })}
        </div>

        {/* Student Motivation & Streak Widget */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
          <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-orange-500/20 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500 animate-bounce" />
                5-Day Study Streak
              </span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 font-mono">
                +150 XP
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
              Keep it up! Consistent daily practice improves your campus placement score.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
