import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  Copy, 
  Check, 
  Trash2, 
  Download, 
  Code, 
  AlertTriangle,
  RefreshCw,
  Square,
  Plus,
  MessageSquare,
  Edit2,
  Paperclip,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Languages,
  BookOpen
} from 'lucide-react';
import { 
  streamGeminiContent, 
  buildMultiTurnContents,
  BTECH_TUTOR_SYSTEM_PROMPT
} from '../../services/gemini';
import {
  getChatSessions,
  saveChatSessions,
  getActiveSessionId,
  setActiveSessionId,
  createNewSession,
  updateSessionMessages,
  renameSession,
  deleteSession
} from '../../services/storage';

const QUICK_PROMPTS = [
  "Explain Dijkstra vs Bellman-Ford with time complexity and negative cycles",
  "Paging vs Segmentation in OS: compare memory allocation & fragmentation",
  "Explain 1NF to BCNF database normalization with an e-commerce schema",
  "Solve step-by-step: Find eigenvalues & eigenvectors for matrix [[2, 1], [1, 2]]",
  "Bhai Operating Systems ke top 5 recurring exam questions Hinglish mein samjha de",
  "Derive the Backpropagation equations for a 2-layer Neural Network"
];

export default function ChatbotTab({ selectedBranch, selectedSemester, onTriggerApiKey }) {
  // Chat Sessions & Active Thread
  const [sessions, setSessions] = useState(() => {
    const existing = getChatSessions();
    if (existing.length > 0) return existing;
    const initial = createNewSession('Introduction to Engineering Study');
    return [initial];
  });

  const [activeSessionId, setActiveId] = useState(() => {
    const existingActive = getActiveSessionId();
    if (existingActive) return existingActive;
    const all = getChatSessions();
    return all.length > 0 ? all[0].id : null;
  });

  // Active Session & Messages
  const currentSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = currentSession?.messages || [];

  // Input & Streaming States
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [attachedFile, setAttachedFile] = useState(null); // { name, size, mimeType, data (base64) }
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [sessionTitleInput, setSessionTitleInput] = useState('');

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync active session in storage
  useEffect(() => {
    if (activeSessionId) {
      setActiveSessionId(activeSessionId);
    }
  }, [activeSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const syncMessages = (newMessages) => {
    if (!currentSession) return;
    updateSessionMessages(currentSession.id, newMessages);
    setSessions(getChatSessions());
  };

  // Switch to a new session
  const handleNewChat = () => {
    const created = createNewSession('New Engineering Chat');
    setSessions(getChatSessions());
    setActiveId(created.id);
    setInput('');
    setAttachedFile(null);
  };

  // Delete session
  const handleDeleteSession = (e, id) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      // Don't leave zero sessions, reset to new
      deleteSession(id);
      const created = createNewSession('New Engineering Chat');
      setSessions([created]);
      setActiveId(created.id);
      return;
    }
    deleteSession(id);
    const updated = getChatSessions();
    setSessions(updated);
    if (activeSessionId === id) {
      setActiveId(updated[0]?.id || null);
    }
  };

  // Start Rename
  const handleStartRename = (e, session) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setSessionTitleInput(session.title);
  };

  // Save Rename
  const handleSaveRename = (e, id) => {
    e.stopPropagation();
    renameSession(id, sessionTitleInput);
    setSessions(getChatSessions());
    setEditingSessionId(null);
  };

  // File Upload Handling (PDF, Text, Code)
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert("File is too large. Please select a document smaller than 20MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result.split(',')[1];
      setAttachedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        mimeType: file.type || 'application/pdf',
        data: base64Data
      });
    };
    reader.readAsDataURL(file);
  };

  // Stop Generating
  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  // Core Send / Stream Handler
  const handleSend = async (textToSend, customFile = null, historyOverride = null) => {
    const query = typeof textToSend === 'string' ? textToSend : input;
    const fileToUse = customFile || attachedFile;

    if ((!query.trim() && !fileToUse) || isStreaming) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query.trim(),
      fileData: fileToUse ? {
        name: fileToUse.name,
        size: fileToUse.size,
        mimeType: fileToUse.mimeType,
        data: fileToUse.data
      } : null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const baseHistory = historyOverride || messages;
    const newMessages = [...baseHistory, userMessage];

    // Placeholder for incoming streaming assistant message
    const assistantId = (Date.now() + 1).toString();
    const initialAssistantMsg = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const withAssistant = [...newMessages, initialAssistantMsg];
    syncMessages(withAssistant);
    setInput('');
    setAttachedFile(null);
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const subjectContext = `${selectedBranch} - Semester ${selectedSemester}`;
      const contents = buildMultiTurnContents(newMessages, subjectContext);

      let accumulated = '';
      await streamGeminiContent({
        contents,
        systemInstruction: BTECH_TUTOR_SYSTEM_PROMPT,
        signal: controller.signal,
        onChunk: (fullText) => {
          accumulated = fullText;
          const updated = [...newMessages, {
            ...initialAssistantMsg,
            content: fullText
          }];
          syncMessages(updated);
        }
      });

    } catch (err) {
      if (err.name === 'AbortError') {
        // User voluntarily stopped generation
        return;
      }

      const errorMsg = err.message || 'Error communicating with Google Gemini API';
      const isKeyMissing = errorMsg.includes('not configured') || errorMsg.includes('503');
      const isKeyInvalid = errorMsg.includes('invalid') || errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('400') || errorMsg.includes('key not valid');
      const isPermission = errorMsg.includes('403') || errorMsg.includes('Permission');
      const isQuota = errorMsg.includes('quota') || errorMsg.includes('429') || errorMsg.includes('rate limit');
      const isKeyProblem = isKeyMissing || isKeyInvalid || isPermission;

      let helpText = '';
      if (isKeyMissing) {
        helpText = '> 🔑 **Fix**: Click **Gemini API** in the top navigation bar to paste your Google AI Studio API key, or add `GEMINI_API_KEY=...` to your `.env` file. Both new `AQ....` and `AIzaSy...` keys are fully supported.';
      } else if (isKeyInvalid) {
        helpText = '> 🔑 **Fix**: The Gemini API key appears invalid or expired. Get a fresh key from [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) and click **Gemini API** in the top bar to update it.';
      } else if (isPermission) {
        helpText = '> 🔒 **Fix**: The API key may not have access to the Generative Language API. Check project permissions in [Google Cloud Console](https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com).';
      } else if (isQuota) {
        helpText = '> ⏳ **Fix**: Gemini API rate limit reached. Wait ~30 seconds for quota replenishment and click Regenerate.';
      }

      const failedMsg = {
        id: assistantId,
        role: 'assistant',
        content: `⚠️ **Academic Assistant Notice**\n\n${errorMsg}\n\n${helpText}`,
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const updated = [...newMessages, failedMsg];
      syncMessages(updated);
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Regenerate Response
  const handleRegenerate = () => {
    if (messages.length < 2 || isStreaming) return;
    const lastUserIdx = [...messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserIdx === -1) return;

    const actualIdx = messages.length - 1 - lastUserIdx;
    const historyUntilUser = messages.slice(0, actualIdx);
    const userMsg = messages[actualIdx];

    handleSend(userMsg.content, userMsg.fileData, historyUntilUser);
  };

  // Edit Message
  const handleStartEdit = (msg) => {
    setEditingMessageId(msg.id);
    setEditingText(msg.content);
  };

  const handleSaveEdit = (msgId) => {
    const idx = messages.findIndex(m => m.id === msgId);
    if (idx === -1) return;

    const historyBefore = messages.slice(0, idx);
    const editedContent = editingText;
    setEditingMessageId(null);
    setEditingText('');

    handleSend(editedContent, null, historyBefore);
  };

  // Keyboard shortcut
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Export Chat
  const handleExportChat = () => {
    const textContent = messages
      .map(m => `### ${m.role === 'user' ? 'Student' : 'EduEngine AI'} (${m.timestamp})\n\n${m.content}\n\n---\n`)
      .join('\n');
    
    const blob = new Blob([textContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentSession.title.replace(/[^a-zA-Z0-9]/g, '_')}_Notes.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Extract follow-up questions from message content
  const extractFollowUps = (rawContent) => {
    if (!rawContent || !rawContent.includes('[FOLLOW_UPS]')) {
      return { cleanContent: rawContent, followUps: [] };
    }
    const [body, followUpsSection] = rawContent.split('[FOLLOW_UPS]');
    const followUps = followUpsSection
      .split('\n')
      .map(line => line.trim().replace(/^[-*•\d.]\s*/, ''))
      .filter(line => line.length > 5);

    return { cleanContent: body.trim(), followUps };
  };

  // Enhanced Markdown Renderer
  const renderMessageContent = (rawContent, msgId) => {
    const { cleanContent, followUps } = extractFollowUps(rawContent);

    // Split code blocks
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(cleanContent)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          text: cleanContent.substring(lastIndex, match.index)
        });
      }
      parts.push({
        type: 'code',
        language: match[1] || 'code',
        code: match[2]
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < cleanContent.length) {
      parts.push({
        type: 'text',
        text: cleanContent.substring(lastIndex)
      });
    }

    return (
      <div className="space-y-3 leading-relaxed">
        {parts.map((part, index) => {
          if (part.type === 'code') {
            const blockId = `${msgId}-code-${index}`;
            return (
              <div key={index} className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 my-2.5 text-xs shadow-md">
                <div className="px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400 font-mono">
                  <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                    <Code className="w-3.5 h-3.5" />
                    {part.language || 'code'}
                  </span>
                  <button
                    onClick={() => copyToClipboard(part.code, blockId)}
                    className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white transition-colors"
                  >
                    {copiedId === blockId ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-sans">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="font-sans">Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 text-slate-100 overflow-x-auto leading-relaxed font-mono">
                  <code>{part.code}</code>
                </pre>
              </div>
            );
          }

          return <div key={index}>{renderTextBlock(part.text)}</div>;
        })}

        {/* Interactive Follow-Up Questions Chips */}
        {followUps && followUps.length > 0 && (
          <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Related Follow-up Inquiries:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {followUps.map((fu, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(fu)}
                  className="px-3 py-1.5 rounded-xl text-left text-xs bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 transition-all flex items-center gap-1.5 group"
                >
                  <ArrowRight className="w-3 h-3 text-indigo-500 opacity-60 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  <span>{fu}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTextBlock = (text) => {
    const lines = text.split('\n');
    const elements = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        i++;
        continue;
      }

      // Horizontal rule
      if (/^-{3,}$/.test(trimmed) || /^\*{3,}$/.test(trimmed)) {
        elements.push(<hr key={`hr-${i}`} className="border-slate-200 dark:border-slate-700 my-3" />);
        i++;
        continue;
      }

      // Headers
      if (trimmed.startsWith('#### ')) {
        elements.push(
          <h5 key={`h5-${i}`} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mt-3 mb-1">
            {renderInline(trimmed.replace('#### ', ''))}
          </h5>
        );
        i++;
        continue;
      }
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h4 key={`h4-${i}`} className="text-sm font-bold text-slate-900 dark:text-white mt-3.5 mb-1.5">
            {renderInline(trimmed.replace('### ', ''))}
          </h4>
        );
        i++;
        continue;
      }
      if (trimmed.startsWith('## ')) {
        elements.push(
          <h3 key={`h3-${i}`} className="text-base font-bold text-slate-900 dark:text-white mt-4 mb-2">
            {renderInline(trimmed.replace('## ', ''))}
          </h3>
        );
        i++;
        continue;
      }

      // Blockquote
      if (trimmed.startsWith('> ')) {
        const quoteLines = [];
        while (i < lines.length && lines[i].trim().startsWith('> ')) {
          quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
          i++;
        }
        elements.push(
          <blockquote key={`bq-${i}`} className="border-l-3 border-indigo-500 pl-3.5 py-1.5 my-2 text-xs text-slate-600 dark:text-slate-300 bg-indigo-50/40 dark:bg-slate-800/40 rounded-r-xl">
            {renderInline(quoteLines.join('\n'))}
          </blockquote>
        );
        continue;
      }

      // Markdown Table
      if (trimmed.includes('|') && trimmed.startsWith('|')) {
        const tableLines = [];
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }
        elements.push(renderTable(tableLines, `table-${elements.length}`));
        continue;
      }

      // Numbered List
      if (/^\d+\.\s/.test(trimmed)) {
        const listItems = [];
        while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
          listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
          i++;
        }
        elements.push(
          <ol key={`ol-${elements.length}`} className="list-decimal pl-5 space-y-1.5 text-xs my-2">
            {listItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed">{renderInline(item)}</li>
            ))}
          </ol>
        );
        continue;
      }

      // Bullet List
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const listItems = [];
        while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
          listItems.push(lines[i].trim().replace(/^[-*]\s+/, ''));
          i++;
        }
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc pl-5 space-y-1.5 text-xs my-2">
            {listItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed">{renderInline(item)}</li>
            ))}
          </ul>
        );
        continue;
      }

      // Paragraph
      elements.push(
        <p key={`p-${i}`} className="text-xs whitespace-pre-line my-1.5 leading-relaxed">
          {renderInline(trimmed)}
        </p>
      );
      i++;
    }

    return <div className="space-y-1">{elements}</div>;
  };

  const renderTable = (tableLines, key) => {
    if (tableLines.length < 2) return null;
    const parseRow = (line) => line.split('|').filter(c => c.trim() !== '').map(c => c.trim());
    const headers = parseRow(tableLines[0]);
    const startIdx = tableLines[1]?.includes('---') ? 2 : 1;
    const rows = tableLines.slice(startIdx).map(parseRow);

    return (
      <div key={key} className="overflow-x-auto my-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800">
              {headers.map((h, idx) => (
                <th key={idx} className="px-3.5 py-2.5 text-left font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700">
                  {renderInline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/40'}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderInline = (text) => {
    if (!text) return null;
    const parts = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining.length > 0) {
      const patterns = [
        { regex: /\*\*(.+?)\*\*/, type: 'bold' },
        { regex: /\*([^*]+?)\*/, type: 'italic' },
        { regex: /`([^`]+?)`/, type: 'code' },
        { regex: /\[([^\]]+)\]\(([^)]+)\)/, type: 'link' },
      ];

      let earliestMatch = null;
      let earliestPattern = null;

      for (const p of patterns) {
        const m = p.regex.exec(remaining);
        if (m && (!earliestMatch || m.index < earliestMatch.index)) {
          earliestMatch = m;
          earliestPattern = p;
        }
      }

      if (!earliestMatch) {
        parts.push(<span key={keyIdx++}>{remaining}</span>);
        break;
      }

      if (earliestMatch.index > 0) {
        parts.push(<span key={keyIdx++}>{remaining.substring(0, earliestMatch.index)}</span>);
      }

      switch (earliestPattern.type) {
        case 'bold':
          parts.push(<strong key={keyIdx++} className="font-semibold text-slate-900 dark:text-white">{earliestMatch[1]}</strong>);
          break;
        case 'italic':
          parts.push(<em key={keyIdx++} className="italic text-slate-600 dark:text-slate-300">{earliestMatch[1]}</em>);
          break;
        case 'code':
          parts.push(
            <code key={keyIdx++} className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-mono text-[11px]">
              {earliestMatch[1]}
            </code>
          );
          break;
        case 'link':
          parts.push(
            <a key={keyIdx++} href={earliestMatch[2]} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              {earliestMatch[1]}
            </a>
          );
          break;
      }

      remaining = remaining.substring(earliestMatch.index + earliestMatch[0].length);
    }

    return parts.length === 1 ? parts[0] : <>{parts}</>;
  };

  return (
    <div className="flex h-[calc(100vh-7.5rem)] max-w-7xl mx-auto bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Left Chat History Drawer */}
      <div className={`
        ${isHistoryOpen ? 'w-64 sm:w-72' : 'w-0'} 
        border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/70 dark:bg-slate-950/50 
        transition-all duration-300 overflow-hidden shrink-0
      `}>
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Study Chats</span>
          </div>
          <button
            onClick={handleNewChat}
            className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1 text-[11px] font-semibold transition-colors"
            title="Start New Chat"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map((s) => {
            const isActive = s.id === activeSessionId;
            const isEditing = editingSessionId === s.id;

            return (
              <div
                key={s.id}
                onClick={() => {
                  setActiveId(s.id);
                }}
                className={`group flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-indigo-900 dark:text-indigo-200 font-semibold shadow-sm border border-indigo-200/60 dark:border-indigo-800/60'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2 truncate min-w-0 flex-1">
                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {isEditing ? (
                    <input
                      type="text"
                      value={sessionTitleInput}
                      onChange={(e) => setSessionTitleInput(e.target.value)}
                      onBlur={(e) => handleSaveRename(e, s.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(e, s.id)}
                      autoFocus
                      className="w-full bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-indigo-500 text-xs focus:outline-none"
                    />
                  ) : (
                    <span className="truncate">{s.title}</span>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleStartRename(e, s)}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title="Rename"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteSession(e, s.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Chat History Drawer"
            >
              {isHistoryOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Bot className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
                  {currentSession?.title || 'B.Tech AI Tutor'}
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Gemini Flash 1.5/2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Targeting: <strong className="text-slate-700 dark:text-slate-300">{selectedBranch}</strong> · Sem {selectedSemester} · English / हिंदी / Hinglish
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportChat}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Export Notes as Markdown"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleNewChat}
              className="sm:hidden p-2 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Stream Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isEditing = editingMessageId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className={`w-8 h-8 rounded-xl ${msg.isError ? 'bg-amber-500' : 'bg-gradient-to-tr from-indigo-600 to-purple-600'} text-white flex items-center justify-center shrink-0 shadow-sm mt-1`}>
                    {msg.isError ? <AlertTriangle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                )}

                <div className={`max-w-[90%] sm:max-w-[78%] rounded-2xl px-4 py-3 shadow-sm ${
                  isUser 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : msg.isError
                    ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-100 rounded-bl-none border border-amber-200 dark:border-amber-800/60'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700/60'
                }`}>
                  {isUser ? (
                    isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full p-2 bg-indigo-700 text-white rounded-lg text-xs focus:outline-none resize-none"
                          rows={3}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingMessageId(null)}
                            className="px-2 py-1 text-[11px] rounded bg-indigo-800 text-indigo-200 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(msg.id)}
                            className="px-2 py-1 text-[11px] rounded bg-white text-indigo-600 font-bold hover:bg-indigo-50"
                          >
                            Save & Resubmit
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {/* Attached File Pill if any */}
                        {msg.fileData && (
                          <div className="mb-2 p-2 rounded-xl bg-indigo-700/70 border border-indigo-500/50 flex items-center gap-2 text-[11px]">
                            <FileText className="w-4 h-4 text-indigo-200" />
                            <div className="truncate">
                              <span className="font-semibold">{msg.fileData.name}</span>
                              <span className="opacity-75 ml-1.5">({msg.fileData.size})</span>
                            </div>
                          </div>
                        )}
                        <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                      </div>
                    )
                  ) : (
                    renderMessageContent(msg.content, msg.id)
                  )}

                  <div className={`mt-2 flex items-center justify-between text-[10px] ${
                    isUser ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      {isUser && !isEditing && (
                        <button
                          onClick={() => handleStartEdit(msg)}
                          className="opacity-75 hover:opacity-100 flex items-center gap-1 hover:underline"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                          <span>Edit</span>
                        </button>
                      )}
                      {!isUser && !msg.isError && (
                        <button
                          onClick={handleRegenerate}
                          className="opacity-75 hover:opacity-100 flex items-center gap-1 hover:underline"
                          title="Regenerate this response"
                        >
                          <RefreshCw className="w-2.5 h-2.5" />
                          <span>Regenerate</span>
                        </button>
                      )}
                    </div>
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Streaming Indicator */}
          {isStreaming && (
            <div className="flex gap-3 items-center text-xs text-indigo-600 dark:text-indigo-400 animate-pulse">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>EduEngine AI is formulating step-by-step academic solution...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Carousel */}
        {messages.length <= 1 && (
          <div className="px-4 sm:px-6 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              High-Yield Exam Prompts (Click to run):
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(qp)}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm"
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Attached File Preview Bar */}
        {attachedFile && (
          <div className="px-6 py-2 bg-indigo-50 dark:bg-indigo-950/40 border-t border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between text-xs text-indigo-800 dark:text-indigo-200">
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="font-semibold truncate">{attachedFile.name}</span>
              <span className="text-[11px] opacity-75">({attachedFile.size})</span>
            </div>
            <button
              onClick={() => setAttachedFile(null)}
              className="p-1 rounded-lg text-indigo-600 hover:bg-indigo-200/50 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Bottom Input Action Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="relative flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 shadow-inner">
            {/* File Upload Hidden Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.txt,.doc,.docx,.c,.cpp,.java,.py,.sql"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors shrink-0"
              title="Upload Notes, Syllabus or PDF document"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Main Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask any B.Tech question, math proof, DSA algorithm or code in English / Hinglish..."
              rows={1}
              className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none resize-none py-1 max-h-32"
            />

            {/* Action Buttons: Stop or Send */}
            {isStreaming ? (
              <button
                onClick={handleStopGenerating}
                className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-rose-500/20 transition-all shrink-0 animate-pulse"
                title="Stop Generating Response"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Stop</span>
              </button>
            ) : (
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() && !attachedFile}
                className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all shrink-0"
                title="Send Message (Enter)"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-1">
            <span className="flex items-center gap-1">
              <Languages className="w-3 h-3 text-indigo-500" />
              Full bilingual support: Hinglish, Hindi, and English.
            </span>
            <span className="hidden sm:inline">Press Enter to send · Shift + Enter for new line</span>
          </div>
        </div>
      </div>
    </div>
  );
}
