import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Upload, 
  Copy, 
  Check, 
  Download, 
  BookOpen, 
  ListOrdered, 
  GitFork, 
  Calculator,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { summarizeNotesWithGemini } from '../../services/gemini';
import { SAMPLE_NOTES } from '../../data/mockData';

export default function NotesSummarizerTab({ onTransferToChat }) {
  const [inputText, setInputText] = useState(SAMPLE_NOTES.osVirtualMemory);
  const [formatType, setFormatType] = useState('bullet'); // bullet, formula, exam, mindmap
  const [summaryOutput, setSummaryOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSummarize = async (overrideType) => {
    const type = overrideType || formatType;
    if (!inputText.trim() || isProcessing) return;

    setIsProcessing(true);
    setSummaryOutput('');

    try {
      const result = await summarizeNotesWithGemini({
        text: inputText,
        formatType: type
      });
      setSummaryOutput(result);
    } catch (e) {
      setSummaryOutput(`⚠️ Error summarizing notes: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const buffer = event.target?.result;
        if (buffer instanceof ArrayBuffer) {
          const textDecoder = new TextDecoder('utf-8', { fatal: false });
          const raw = textDecoder.decode(buffer);
          const textMatches = [];
          const regex = /\(([^)]+)\)\s*(?:Tj|TJ)/g;
          let m;
          while ((m = regex.exec(raw)) !== null) {
            textMatches.push(m[1]);
          }
          if (textMatches.length > 5) {
            setInputText(`[Extracted from ${file.name}]\n\n${textMatches.join(' ')}`);
          } else {
            const printable = raw.replace(/[^\x20-\x7E\t\n\r]/g, ' ')
              .replace(/\s+/g, ' ')
              .slice(0, 8000);
            setInputText(`[Extracted from ${file.name}]\n\n${printable}`);
          }
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
          setInputText(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([summaryOutput], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BTech_AI_Summary_${formatType}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/20 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
              <FileText className="w-4 h-4" />
              AI Notes Summarizer & Document Analyzer
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Transform Dense Lecture Notes into Exam Intel
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Powered by Google Gemini: Extract key formulas, high-probability semester exam questions, or mind-map hierarchies in seconds.
            </p>
          </div>

          {/* Sample Preloaders */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden lg:inline">
              Sample Notes:
            </span>
            <button
              onClick={() => {
                setInputText(SAMPLE_NOTES.osVirtualMemory);
                handleSummarize('bullet');
              }}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              OS Virtual Memory
            </button>
            <button
              onClick={() => {
                setInputText(SAMPLE_NOTES.dbmsNormalization);
                handleSummarize('exam');
              }}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              DBMS 3NF/BCNF
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Input Notes & Output Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Notes Input */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col h-[560px] shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              Source Lecture Notes / Textbook Text
            </div>
            <label className="cursor-pointer text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              Upload .txt / .md
              <input
                type="file"
                accept=".txt,.md,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste raw lecture notes, syllabus content, or research papers here..."
            className="flex-1 w-full p-3.5 text-xs sm:text-sm font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none leading-relaxed"
          />

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            {/* Format Selection Chips */}
            <div className="flex items-center gap-2 text-xs overflow-x-auto pb-1">
              <span className="font-semibold text-slate-400 shrink-0 text-[11px]">Format:</span>
              <button
                onClick={() => setFormatType('bullet')}
                className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 text-xs transition-all shrink-0 ${
                  formatType === 'bullet'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                Executive Summary
              </button>
              <button
                onClick={() => setFormatType('formula')}
                className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 text-xs transition-all shrink-0 ${
                  formatType === 'formula'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                Formulas & Bounds
              </button>
              <button
                onClick={() => setFormatType('exam')}
                className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 text-xs transition-all shrink-0 ${
                  formatType === 'exam'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Exam 2M & 5M Q&A
              </button>
              <button
                onClick={() => setFormatType('mindmap')}
                className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 text-xs transition-all shrink-0 ${
                  formatType === 'mindmap'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <GitFork className="w-3.5 h-3.5" />
                Mind-Map Outline
              </button>
            </div>

            {/* Summarize Action */}
            <button
              onClick={() => handleSummarize()}
              disabled={isProcessing || !inputText.trim()}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              {isProcessing ? 'Analyzing with Gemini AI...' : 'Generate AI Summary'}
            </button>
          </div>
        </div>

        {/* Right Column: AI Output */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col h-[560px] shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Generated AI Synthesis
            </div>
            {summaryOutput && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Copy to Clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleDownload}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Download Markdown"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans space-y-3">
            {isProcessing ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
                <p className="text-xs font-medium">Extracting core principles & formatting formulas...</p>
              </div>
            ) : summaryOutput ? (
              <div className="whitespace-pre-line">
                {summaryOutput}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-slate-400 p-8">
                <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                <span className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                  Ready to Summarize
                </span>
                <p className="text-[11px] max-w-xs">
                  Choose your format on the left and click "Generate AI Summary" to create structured revision sheets!
                </p>
              </div>
            )}
          </div>

          {summaryOutput && (
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Formatted for B.Tech Exam Revision</span>
              <button
                onClick={() => onTransferToChat && onTransferToChat(`Here is my summarized lecture notes:\n\n${summaryOutput}\n\nPlease ask me 3 viva questions to test my understanding.`)}
                className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Practice Viva with AI Tutor
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
