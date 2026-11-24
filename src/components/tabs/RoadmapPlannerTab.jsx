import React, { useState } from 'react';
import { 
  Compass, 
  CheckCircle2, 
  Circle, 
  Calculator, 
  BookOpen, 
  Award, 
  Sparkles, 
  TrendingUp, 
  Layers, 
  GraduationCap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { SEMESTER_SUBJECTS, CAREER_ROADMAPS } from '../../data/mockData';

const GRADE_POINTS = [
  { grade: "O (Outstanding)", points: 10 },
  { grade: "A+ (Excellent)", points: 9 },
  { grade: "A (Very Good)", points: 8 },
  { grade: "B+ (Good)", points: 7 },
  { grade: "B (Above Average)", points: 6 },
  { grade: "C (Average)", points: 5 },
  { grade: "P (Pass)", points: 4 }
];

export default function RoadmapPlannerTab({ selectedSemester, setSelectedSemester, onAskTutorAboutTopic }) {
  const [activeSubTab, setActiveSubTab] = useState('syllabus'); // 'syllabus', 'career', 'cgpa'
  
  // Completed subjects state stored in localStorage
  const [completedSubjects, setCompletedSubjects] = useState(() => {
    const saved = localStorage.getItem('btech_completed_subjects');
    return saved ? JSON.parse(saved) : {};
  });

  // Career track milestones
  const [careerTracks, setCareerTracks] = useState(CAREER_ROADMAPS);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);

  // CGPA Calculator state
  const currentSemesterSubjects = SEMESTER_SUBJECTS[selectedSemester] || SEMESTER_SUBJECTS[1];
  const [subjectGrades, setSubjectGrades] = useState(() => {
    const initial = {};
    currentSemesterSubjects.forEach(s => { initial[s.code] = 9; });
    return initial;
  });

  const toggleSubject = (code) => {
    const next = { ...completedSubjects, [code]: !completedSubjects[code] };
    setCompletedSubjects(next);
    localStorage.setItem('btech_completed_subjects', JSON.stringify(next));
  };

  const toggleMilestone = (trackIdx, semIdx, itemIdx) => {
    const updated = JSON.parse(JSON.stringify(careerTracks));
    const current = updated[trackIdx].semesters[semIdx].items[itemIdx].done;
    updated[trackIdx].semesters[semIdx].items[itemIdx].done = !current;
    setCareerTracks(updated);
  };

  // SGPA Calculation
  const calculateSGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;
    currentSemesterSubjects.forEach(s => {
      const grade = subjectGrades[s.code] || 8;
      totalPoints += grade * s.credits;
      totalCredits += s.credits;
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
            <Compass className="w-4 h-4" />
            Engineering Academic & Career Navigator
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Semester Tracker, SGPA & Career Roadmaps
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Track B.Tech syllabus completion from Sem 1 to 8, calculate target semester GPAs, and follow structured roadmaps for top tech placements.
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shrink-0">
          <button
            onClick={() => setActiveSubTab('syllabus')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'syllabus'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Syllabus Tracker
          </button>
          <button
            onClick={() => setActiveSubTab('career')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'career'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Career Roadmaps
          </button>
          <button
            onClick={() => setActiveSubTab('cgpa')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'cgpa'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            SGPA Calculator
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: SYLLABUS & SEMESTER TRACKER                       */}
      {/* ========================================================= */}
      {activeSubTab === 'syllabus' && (
        <div className="space-y-6">
          {/* Semester Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                  selectedSemester === sem
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                Semester {sem}
              </button>
            ))}
          </div>

          {/* Subjects Table Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Semester {selectedSemester} Core Curriculum & Labs
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Mark completed subjects to maintain a verifiable college audit trail
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                  {currentSemesterSubjects.filter(s => completedSubjects[s.code]).length} of {currentSemesterSubjects.length} Completed
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              {currentSemesterSubjects.map((sub) => {
                const isDone = !!completedSubjects[sub.code];
                return (
                  <div
                    key={sub.code}
                    onClick={() => toggleSubject(sub.code)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isDone
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900/60 text-slate-800 dark:text-slate-200'
                        : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400 shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {sub.code}
                          </span>
                          <span className={`text-xs font-semibold ${isDone ? 'line-through text-slate-400' : ''}`}>
                            {sub.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {sub.type} · {sub.credits} Credits
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAskTutorAboutTopic && onAskTutorAboutTopic(`Please give me a complete B.Tech syllabus overview and top 5 important units for ${sub.name} (${sub.code}).`);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 flex items-center gap-1 font-medium"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      AI Syllabus Guide
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: CAREER ROADMAPS                                   */}
      {/* ========================================================= */}
      {activeSubTab === 'career' && (
        <div className="space-y-6">
          {/* Track Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {careerTracks.map((track, idx) => (
              <div
                key={track.id}
                onClick={() => setSelectedTrackIndex(idx)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedTrackIndex === idx
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  {track.title}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  {track.description}
                </p>
              </div>
            ))}
          </div>

          {/* Active Track Roadmap */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {careerTracks[selectedTrackIndex]?.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {careerTracks[selectedTrackIndex]?.description}
                </p>
              </div>
              <button
                onClick={() => onAskTutorAboutTopic && onAskTutorAboutTopic(`I am preparing for ${careerTracks[selectedTrackIndex]?.title}. What are the top 3 open-source projects or internships I should pursue in my current semester?`)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Ask AI Strategy
              </button>
            </div>

            {/* Semester Phases */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {careerTracks[selectedTrackIndex]?.semesters.map((phase, semIdx) => {
                const total = phase.items.length;
                const completed = phase.items.filter(i => i.done).length;

                return (
                  <div key={semIdx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
                        {phase.sem}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {completed}/{total} Done
                      </span>
                    </div>

                    <div className="space-y-2">
                      {phase.items.map((item, itIdx) => (
                        <div
                          key={itIdx}
                          onClick={() => toggleMilestone(selectedTrackIndex, semIdx, itIdx)}
                          className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer hover:text-indigo-600 transition-colors"
                        >
                          {item.done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <span className={item.done ? 'line-through text-slate-400' : ''}>
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 3: SGPA & TARGET CGPA CALCULATOR                     */}
      {/* ========================================================= */}
      {activeSubTab === 'cgpa' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Input Grades (2 cols) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-500" />
                Semester {selectedSemester} SGPA Calculator
              </h3>
              <span className="text-xs text-slate-500">
                Formula: $\sum (Credits \times Grade) / \sum Credits$
              </span>
            </div>

            <div className="space-y-3">
              {currentSemesterSubjects.map((sub) => (
                <div
                  key={sub.code}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {sub.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {sub.code} · {sub.credits} Credits
                    </div>
                  </div>

                  <select
                    value={subjectGrades[sub.code] || 8}
                    onChange={(e) => setSubjectGrades(prev => ({ ...prev, [sub.code]: Number(e.target.value) }))}
                    className="px-2.5 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 cursor-pointer"
                  >
                    {GRADE_POINTS.map(gp => (
                      <option key={gp.points} value={gp.points}>
                        {gp.grade} ({gp.points} pts)
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Calculated Result Card (1 col) */}
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-200 mb-2">
                Projected Semester Result
              </div>
              <div className="text-5xl font-black font-mono tracking-tight">
                {calculateSGPA()}
              </div>
              <div className="text-xs text-indigo-200 mt-1">
                Calculated SGPA out of 10.00
              </div>

              <div className="mt-6 pt-6 border-t border-indigo-500/40 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-indigo-200">Total Credits:</span>
                  <span className="font-bold">
                    {currentSemesterSubjects.reduce((acc, s) => acc + s.credits, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-200">Classification:</span>
                  <span className="font-bold">
                    {Number(calculateSGPA()) >= 8.5 ? 'First Class with Distinction' : Number(calculateSGPA()) >= 6.75 ? 'First Class' : 'Second Class'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm text-[11px] text-indigo-100 mt-6">
              💡 <strong>Placement Tip:</strong> Most Tier-1 product companies (Amazon, Microsoft, Google) require a minimum aggregate of <strong>7.5+ CGPA</strong> with zero active backlogs.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
