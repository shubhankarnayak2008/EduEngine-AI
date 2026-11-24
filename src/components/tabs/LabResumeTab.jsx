import React, { useState } from 'react';
import { 
  Briefcase, 
  FileText, 
  Award, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  FolderGit2, 
  UserCheck, 
  HelpCircle,
  RotateCw
} from 'lucide-react';
import { generateLabReportWithGemini, analyzeResumeWithGemini } from '../../services/gemini';

const SAMPLE_LAB_EXPERIMENTS = [
  {
    title: "Producer-Consumer Problem using Semaphores",
    subject: "Operating Systems Lab (CS402P)",
    objective: "To simulate the classic Producer-Consumer synchronization problem using POSIX counting semaphores and mutex locks in C++."
  },
  {
    title: "Single Source Shortest Path using Dijkstra's Algorithm",
    subject: "Data Structures & Algorithms Lab (CS302P)",
    objective: "To implement Dijkstra's algorithm using an adjacency list and min-heap priority queue, and analyze time complexity."
  },
  {
    title: "Implementation of 3-Tier Web Architecture with REST API",
    subject: "Full Stack Development Lab",
    objective: "To construct a scalable 3-tier application consisting of a React client, Node.js API server, and normalized PostgreSQL database."
  }
];

const SAMPLE_RESUME_TEXT = `John Doe | B.Tech Computer Science & Engineering (CGPA: 8.4)
Skills: C++, Python, Data Structures & Algorithms, React, Node.js, SQL, Git

Projects:
- E-Commerce Web Application: Built a shopping platform using React, Node, and MongoDB. Implemented cart and user login.
- Disease Prediction using Machine Learning: Trained a classification model using Python and Scikit-Learn on hospital datasets.

Coursework: Operating Systems, Database Management Systems, Computer Networks, Software Engineering.`;

export default function LabResumeTab({ onAskInChat }) {
  const [activeTool, setActiveTool] = useState('lab'); // 'lab', 'synopsis', 'resume'

  // Lab Report States
  const [labTitle, setLabTitle] = useState(SAMPLE_LAB_EXPERIMENTS[0].title);
  const [labSubject, setLabSubject] = useState(SAMPLE_LAB_EXPERIMENTS[0].subject);
  const [labObjective, setLabObjective] = useState(SAMPLE_LAB_EXPERIMENTS[0].objective);

  // Resume States
  const [resumeText, setResumeText] = useState(SAMPLE_RESUME_TEXT);
  const [targetJob, setTargetJob] = useState("Software Development Engineer - 1 (SDE-1)");

  // Shared Output State
  const [outputResult, setOutputResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateLabReport = async () => {
    if (!labTitle.trim() || isGenerating) return;
    setIsGenerating(true);
    setOutputResult('');

    try {
      const res = await generateLabReportWithGemini({
        experimentTitle: labTitle,
        subject: labSubject,
        objective: labObjective
      });
      setOutputResult(res);
    } catch (e) {
      setOutputResult(`⚠️ Error generating report: ${e.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyzeResume = async () => {
    if (!resumeText.trim() || isGenerating) return;
    setIsGenerating(true);
    setOutputResult('');

    try {
      const res = await analyzeResumeWithGemini({
        resumeText,
        targetJob
      });
      setOutputResult(res);
    } catch (e) {
      setOutputResult(`⚠️ Error analyzing resume: ${e.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([outputResult], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BTech_${activeTool === 'lab' ? 'Lab_Record' : 'Resume_ATS_Analysis'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 border border-violet-500/20 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-1">
            <Briefcase className="w-4 h-4" />
            AI Lab Record & Placement Helper
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Practical Records & Career Placement Readiness
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Generate formal university lab records with viva questions, or scan your resume against SDE job descriptions using Google XYZ metrics.
          </p>
        </div>

        {/* Tool Switcher */}
        <div className="flex items-center p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shrink-0">
          <button
            onClick={() => { setActiveTool('lab'); setOutputResult(''); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTool === 'lab'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Lab Record Generator
          </button>
          <button
            onClick={() => { setActiveTool('resume'); setOutputResult(''); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTool === 'resume'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Resume & ATS Analyzer
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Inputs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col h-[600px] shadow-sm">
          {activeTool === 'lab' ? (
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-violet-500" />
                  Lab Experiment Details
                </h3>

                <div className="flex gap-1">
                  {SAMPLE_LAB_EXPERIMENTS.map((exp, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setLabTitle(exp.title);
                        setLabSubject(exp.subject);
                        setLabObjective(exp.objective);
                      }}
                      className="text-[10px] px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600"
                    >
                      Exp {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Subject / Lab Course:
                </label>
                <input
                  type="text"
                  value={labSubject}
                  onChange={(e) => setLabSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Experiment Title:
                </label>
                <input
                  type="text"
                  value={labTitle}
                  onChange={(e) => setLabTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="flex-1 flex flex-col">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Aim & Objective Description:
                </label>
                <textarea
                  value={labObjective}
                  onChange={(e) => setLabObjective(e.target.value)}
                  placeholder="State the objective of this lab experiment..."
                  className="flex-1 w-full p-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none leading-relaxed"
                />
              </div>

              <button
                onClick={handleGenerateLabReport}
                disabled={isGenerating || !labTitle.trim()}
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-violet-500/25 transition-all cursor-pointer"
              >
                <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Generating Formal Lab Record...' : 'Generate Lab Record & Viva Q&A'}
              </button>
            </div>
          ) : (
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-violet-500" />
                  B.Tech Placement Resume & Target Role
                </h3>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Company / Placement Role:
                </label>
                <input
                  type="text"
                  value={targetJob}
                  onChange={(e) => setTargetJob(e.target.value)}
                  placeholder="e.g. SDE-1 at Amazon, Cloud Engineer at Google, Full Stack Developer..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="flex-1 flex flex-col">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Paste Resume Content (Education, Skills, Projects):
                </label>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here..."
                  className="flex-1 w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none leading-relaxed"
                />
              </div>

              <button
                onClick={handleAnalyzeResume}
                disabled={isGenerating || !resumeText.trim()}
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-violet-500/25 transition-all cursor-pointer"
              >
                <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Evaluating ATS Score & Bullets...' : 'Audit Resume & Rewrite Project Bullets'}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Output */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col h-[600px] shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <Award className="w-4 h-4 text-violet-500" />
              Generated Document & Recommendations
            </div>
            {outputResult && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Copy"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleDownload}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans space-y-3">
            {isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-slate-400">
                <RotateCw className="w-8 h-8 animate-spin text-violet-500" />
                <p className="text-xs font-medium">Generating structured academic documentation...</p>
              </div>
            ) : outputResult ? (
              <div className="whitespace-pre-line">
                {outputResult}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-slate-400 p-8">
                <Briefcase className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                <span className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                  Ready to Assist
                </span>
                <p className="text-[11px] max-w-xs">
                  Fill in the parameters on the left and click the action button to generate full lab reports with viva questions or ATS resume evaluations.
                </p>
              </div>
            )}
          </div>

          {outputResult && (
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Academic & Placement Format Ready</span>
              <button
                onClick={() => onAskInChat && onAskInChat(`I generated this ${activeTool === 'lab' ? 'lab practical report' : 'resume analysis'}:\n\n${outputResult.slice(0, 1000)}\n\nCan you prepare me with 3 follow-up technical questions?`)}
                className="text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Practice Interview Questions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
