import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Headphones, 
  Sparkles, 
  Coffee, 
  CloudRain, 
  Radio, 
  Waves,
  Clock
} from 'lucide-react';
import { ambientAudio } from '../../services/audioSynthesizer';

const TIMER_MODES = [
  { id: 'work25', label: 'Work 25m', duration: 25 * 60, type: 'work' },
  { id: 'work50', label: 'Deep Work 50m', duration: 50 * 60, type: 'work' },
  { id: 'shortBreak', label: 'Short Break 5m', duration: 5 * 60, type: 'break' },
  { id: 'longBreak', label: 'Long Break 15m', duration: 15 * 60, type: 'break' }
];

const AMBIENT_TRACKS = [
  { id: 'rain', name: 'Gentle Rain', icon: CloudRain, fn: () => ambientAudio.playRain() },
  { id: 'lofi', name: 'Lo-Fi Warm Chords', icon: Radio, fn: () => ambientAudio.playLofi() },
  { id: 'brown', name: 'Deep Focus Brown Noise', icon: Waves, fn: () => ambientAudio.playBrownNoise() },
  { id: 'alpha', name: '40Hz Alpha Focus Waves', icon: Headphones, fn: () => ambientAudio.playAlphaBeats() }
];

export default function PomodoroTab() {
  const [activeMode, setActiveMode] = useState(TIMER_MODES[0]);
  const [timeLeft, setTimeLeft] = useState(TIMER_MODES[0].duration);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  // Audio ambient controls
  const [currentAudio, setCurrentAudio] = useState(null); // 'rain' | 'lofi' | 'brown' | 'alpha' | null
  const [volume, setVolume] = useState(0.4);

  // Task checklist
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Revise Operating Systems: Semaphores & Deadlock', done: true },
    { id: 2, text: 'Solve 3 LeetCode problems on Binary Search Trees', done: false },
    { id: 3, text: 'Prepare DBMS Normalization 1NF to BCNF notes', done: false }
  ]);
  const [newTaskText, setNewTaskText] = useState('');

  // Countdown timer loop
  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      ambientAudio.playChime();
      if (activeMode.type === 'work') {
        setCompletedSessions(prev => prev + 1);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, activeMode]);

  // Update browser document tab title with remaining time
  useEffect(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    if (isRunning) {
      document.title = `(${formatted}) ${activeMode.label} - EduEngine AI`;
    } else {
      document.title = 'EduEngine AI - Smart B.Tech Study Assistant';
    }
  }, [timeLeft, isRunning, activeMode]);

  const handleModeChange = (mode) => {
    setActiveMode(mode);
    setTimeLeft(mode.duration);
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(activeMode.duration);
  };

  const handleToggleAudio = (track) => {
    if (currentAudio === track.id) {
      ambientAudio.stop();
      setCurrentAudio(null);
    } else {
      track.fn();
      ambientAudio.setVolume(volume);
      setCurrentAudio(track.id);
    }
  };

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    ambientAudio.setVolume(newVol);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks(prev => [...prev, { id: Date.now(), text: newTaskText.trim(), done: false }]);
    setNewTaskText('');
  };

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const progressPercent = ((activeMode.duration - timeLeft) / activeMode.duration) * 100;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Banner */}
      <div className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border border-cyan-500/20 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-1">
            <Clock className="w-4 h-4" />
            Pomodoro Focus Timer & Ambient Audio
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Laser-Focused Engineering Study Sessions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Time-boxed intervals paired with offline synthesized focus sounds (Rain, Lo-Fi, Brown Noise, 40Hz Alpha) to maximize retention.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Coffee className="w-4 h-4 text-amber-500" />
          <span>Sessions Completed:</span>
          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{completedSessions}</span>
        </div>
      </div>

      {/* Main Grid: Timer on Left, Ambient Music & Tasks on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pomodoro Circular Timer (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-between shadow-sm space-y-6">
          {/* Mode Switcher */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {TIMER_MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeMode.id === mode.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Large Countdown Display */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-8 border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center p-6 shadow-inner">
            {/* SVG Progress Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                className="stroke-indigo-600 dark:stroke-indigo-500 fill-none transition-all duration-300"
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * progressPercent) / 100}
                strokeLinecap="round"
              />
            </svg>

            <div className="relative z-10 text-center">
              <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </div>
              <div className="text-xs uppercase font-bold tracking-wider text-slate-400 mt-2">
                {isRunning ? (activeMode.type === 'work' ? '🔥 Focus Time' : '☕ Relax') : 'Paused'}
              </div>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsRunning(!isRunning)}
              className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-current" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" /> Start Focus
                </>
              )}
            </button>

            <button
              onClick={() => {
                setTimeLeft(0);
              }}
              className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              title="Skip Session"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Column: Offline Ambient Audio & Study Checklist (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Ambient Sound Synthesizer Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-indigo-500" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Ambient Focus Audio (Web Audio)
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                100% Offline
              </span>
            </div>

            {/* Sound Buttons Grid */}
            <div className="grid grid-cols-2 gap-2">
              {AMBIENT_TRACKS.map(t => {
                const Icon = t.icon;
                const isActive = currentAudio === t.id;

                return (
                  <button
                    key={t.id}
                    onClick={() => handleToggleAudio(t)}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{t.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Volume Slider */}
            <div className="pt-2 flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <span className="text-[11px] font-mono text-slate-400 w-8">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>

          {/* Study Checklist Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Session Goals & Tasks ({tasks.filter(t => t.done).length}/{tasks.length})
            </h4>

            {/* Add Task Form */}
            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Add study objective..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* Task Items */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 text-xs"
                >
                  <div
                    onClick={() => toggleTask(task.id)}
                    className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                  >
                    {task.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className={`truncate ${task.done ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {task.text}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors ml-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
