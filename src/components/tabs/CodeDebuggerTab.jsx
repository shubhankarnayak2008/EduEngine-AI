import React, { useState } from 'react';
import {
  Bug,
  Play,
  Sparkles,
  Check,
  Copy,
  Code,
  AlertTriangle,
  RotateCw,
  Zap,
  FileCode2,
  Terminal
} from 'lucide-react';
import { debugCodeWithGemini } from '../../services/gemini';
import { BUG_SCENARIOS } from '../../data/mockData';

const SUPPORTED_LANGUAGES = [
  { id: 'cpp', name: 'C++ (G++ 17)' },
  { id: 'python', name: 'Python 3' },
  { id: 'java', name: 'Java (JDK 21)' }, { id: 'sql', name: 'SQL (PostgreSQL/MySQL)' },
  { id: 'c', name: 'C' }
];

export default function CodeDebuggerTab({ onAskInChat }) {
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState(BUG_SCENARIOS[0].code);
  const [errorDescription, setErrorDescription] = useState(BUG_SCENARIOS[0].errorType);
  const [debugOutput, setDebugOutput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDebug = async () => {
    if (!code.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setDebugOutput('');

    try {
      const result = await debugCodeWithGemini({
        language,
        code,
        errorDescription
      });
      setDebugOutput(result);
    } catch (e) {
      setDebugOutput(`⚠️ Error during code analysis: ${e.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadScenario = (scenario) => {
    setLanguage(scenario.language);
    setCode(scenario.code);
    setErrorDescription(scenario.errorType);
    setDebugOutput('');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(debugOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-500/10 via-red-500/10 to-amber-500/10 border border-rose-500/20 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1">
            <Bug className="w-4 h-4" />
            AI Code & Bug Debugger Assistant
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Root Cause Analysis & Complexity Optimization
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Paste buggy C++, Python, Java or SQL code. Gemini analyzes stack traces, detects memory leaks, fixes edge cases, and provides Big-O analysis.
          </p>
        </div>

        {/* Demo Bug Scenario Preloaders */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden lg:inline">
            Showcase Bugs:
          </span>
          {BUG_SCENARIOS.map(sc => (
            <button
              key={sc.id}
              onClick={() => handleLoadScenario(sc)}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {sc.name.split(' ')[0]} {sc.language.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Editor & AI Analysis Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Code Editor Window */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col h-[580px] shadow-sm">
          {/* Header Controls */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-rose-500" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={errorDescription}
                onChange={(e) => setErrorDescription(e.target.value)}
                placeholder="Error type (e.g. SegFault, TLE, NPE)..."
                className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 w-44"
              />
            </div>
          </div>

          {/* Code Textarea */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your source code here..."
            className="flex-1 w-full p-4 font-mono text-xs sm:text-sm bg-slate-950 text-slate-100 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none leading-relaxed"
            spellCheck={false}
          />

          {/* Action Button */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleDebug}
              disabled={isAnalyzing || !code.trim()}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-500/25 transition-all cursor-pointer"
            >
              <Zap className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Gemini is Debugging & Analyzing...' : 'Analyze, Debug & Optimize Code'}
            </button>
          </div>
        </div>

        {/* Right: AI Debugger Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col h-[580px] shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-rose-500" />
              Gemini Root Cause & Fix Report
            </div>
            {debugOutput && (
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-rose-600"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Report'}
              </button>
            )}
          </div>

          {/* Report Content */}
          <div className="flex-1 overflow-y-auto p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans space-y-3">
            {isAnalyzing ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-slate-400">
                <RotateCw className="w-8 h-8 animate-spin text-rose-500" />
                <p className="text-xs font-medium">Scanning AST, pointer references, and complexity...</p>
              </div>
            ) : debugOutput ? (
              <div className="whitespace-pre-line font-mono text-xs">
                {debugOutput}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-slate-400 p-8">
                <FileCode2 className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                <span className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                  Ready to Debug
                </span>
                <p className="text-[11px] max-w-xs">
                  Click one of the "Showcase Bugs" above or paste code on the left and click "Analyze & Debug".
                </p>
              </div>
            )}
          </div>

          {debugOutput && (
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Includes Big-O Complexity Bounds</span>
              <button
                onClick={() => onAskInChat && onAskInChat(`I am debugging this ${language} code:\n\`\`\`${language}\n${code}\n\`\`\`\nCan you explain how this works in a university lab viva?`)}
                className="text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Ask Viva Questions on this Fix
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
