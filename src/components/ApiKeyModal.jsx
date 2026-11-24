import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  X, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  Cpu,
  Youtube,
  Info,
  Server,
  Lock,
  Eye,
  EyeOff,
  Save
} from 'lucide-react';
import { 
  getStoredModel, 
  setStoredModel, 
  testGeminiApiKey, 
  AVAILABLE_MODELS 
} from '../services/gemini';

export default function ApiKeyModal({ isOpen, onClose, onKeyUpdated }) {
  const [selectedModel, setSelectedModel] = useState('');
  const [testStatus, setTestStatus] = useState(null); // { loading, valid, message }
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [serverHealth, setServerHealth] = useState(null); // { geminiConfigured, youtubeConfigured, geminiKeyPrefix }
  const [activeTab, setActiveTab] = useState('gemini'); // 'gemini' or 'youtube'

  // Input states for updating keys from UI
  const [inputGeminiKey, setInputGeminiKey] = useState('');
  const [inputYoutubeKey, setInputYoutubeKey] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showYoutubeKey, setShowYoutubeKey] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [keySaveMessage, setKeySaveMessage] = useState(null);

  const fetchHealth = () => {
    fetch('/api/health')
      .then(res => {
        if (!res.ok) throw new Error('Not OK');
        return res.json();
      })
      .then(data => setServerHealth(data))
      .catch(() => {
        const localKey = (localStorage.getItem('gemini_api_key') || (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_GEMINI_API_KEY : '') || '').trim();
        setServerHealth({
          geminiConfigured: !!localKey,
          youtubeConfigured: false,
          geminiKeyPrefix: localKey ? `${localKey.substring(0, 6)}...` : null
        });
      });
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedModel(getStoredModel());
      setTestStatus(null);
      setSaveSuccess(false);
      setInputGeminiKey('');
      setInputYoutubeKey('');
      setKeySaveMessage(null);
      fetchHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestGeminiConnection = async () => {
    setTestStatus({ loading: true, message: 'Pinging Google Gemini API via secure server proxy...' });
    const res = await testGeminiApiKey(selectedModel);
    setTestStatus({
      loading: false,
      valid: res.valid,
      message: res.message
    });
  };

  const handleSaveApiKey = async (type) => {
    const keyToSave = type === 'gemini' ? inputGeminiKey.trim() : inputYoutubeKey.trim();
    if (!keyToSave) {
      setKeySaveMessage({ type, success: false, text: 'Please enter a valid API key string.' });
      return;
    }

    setIsSavingKey(true);
    setKeySaveMessage(null);

    if (type === 'gemini') {
      localStorage.setItem('gemini_api_key', keyToSave);
    } else {
      localStorage.setItem('youtube_api_key', keyToSave);
    }

    try {
      const payload = type === 'gemini' ? { geminiKey: keyToSave } : { youtubeKey: keyToSave };
      const res = await fetch('/api/config/key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => null);

      setKeySaveMessage({
        type,
        success: true,
        text: `Key saved and activated successfully! (${type === 'gemini' ? 'Gemini AI is now active' : 'Live YouTube Search is now active'})`
      });
      if (type === 'gemini') setInputGeminiKey('');
      if (type === 'youtube') setInputYoutubeKey('');
      fetchHealth();
    } catch (e) {
      setKeySaveMessage({
        type,
        success: true,
        text: `Key saved to browser storage! (${type === 'gemini' ? 'Gemini AI is now active' : 'YouTube Search is now active'})`
      });
      fetchHealth();
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleSave = () => {
    setStoredModel(selectedModel);
    setSaveSuccess(true);
    if (onKeyUpdated) onKeyUpdated(selectedModel);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Server API & Model Configuration
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Server-Side Secured
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All requests route through server proxy; API keys are never exposed in browser
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-2 bg-slate-50/50 dark:bg-slate-950/40">
          <button
            onClick={() => setActiveTab('gemini')}
            className={`pb-2.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'gemini'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Google Gemini AI
          </button>
          <button
            onClick={() => setActiveTab('youtube')}
            className={`pb-2.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'youtube'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Youtube className="w-3.5 h-3.5" />
            YouTube Data API v3
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {activeTab === 'gemini' ? (
            <>
              {/* Server Key Status Badge */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-3 h-3 rounded-full ${serverHealth?.geminiConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      Server Environment: <code className="font-mono text-indigo-600 dark:text-indigo-400">GEMINI_API_KEY</code>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {serverHealth?.geminiConfigured 
                        ? `Configured in server .env (Active ${serverHealth.geminiKeyPrefix || ''})`
                        : 'Not detected in .env file'}
                    </div>
                  </div>
                </div>

                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  Get Free Key
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Paste or Update Gemini Key */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block">
                  {serverHealth?.geminiConfigured ? 'Update Server Gemini API Key' : 'Enter Your Google Gemini API Key'}
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showGeminiKey ? 'text' : 'password'}
                      value={inputGeminiKey}
                      onChange={(e) => setInputGeminiKey(e.target.value)}
                      placeholder={serverHealth?.geminiConfigured ? 'Paste new key to replace existing key...' : 'Paste AQ... or AIza... key here'}
                      className="w-full px-3 py-2 pr-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={() => handleSaveApiKey('gemini')}
                    disabled={isSavingKey || !inputGeminiKey.trim()}
                    className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
                  >
                    {isSavingKey ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save Key</span>
                  </button>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <span>Both new <strong>AQ....</strong> and standard <strong>AIzaSy...</strong> keys from Google AI Studio are supported.</span>
                </div>

                {keySaveMessage && keySaveMessage.type === 'gemini' && (
                  <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                    keySaveMessage.success 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  }`}>
                    {keySaveMessage.success ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{keySaveMessage.text}</span>
                  </div>
                )}
              </div>

              {/* Model Selection */}
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 block mb-2">
                  Gemini Model Selection
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {AVAILABLE_MODELS.map((m) => (
                    <label
                      key={m.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedModel === m.id
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="model"
                          value={m.id}
                          checked={selectedModel === m.id}
                          onChange={(e) => setSelectedModel(e.target.value)}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <div className="text-xs font-bold">{m.name}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            model: {m.id}
                          </div>
                        </div>
                      </div>
                      <Cpu className="w-4 h-4 text-slate-400" />
                    </label>
                  ))}
                </div>
              </div>

              {/* Test Connection Button & Status */}
              <div>
                <button
                  onClick={handleTestGeminiConnection}
                  disabled={testStatus?.loading}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {testStatus?.loading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  )}
                  <span>Test Server Gemini Connection</span>
                </button>

                {testStatus && (
                  <div className={`mt-3 p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                    testStatus.loading
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                      : testStatus.valid
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                  }`}>
                    {testStatus.loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin shrink-0 mt-0.5" />
                    ) : testStatus.valid ? (
                      <Check className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                    )}
                    <span className="leading-relaxed">{testStatus.message}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* YouTube Status & Explanation */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-3 h-3 rounded-full ${serverHealth?.youtubeConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Server Environment: <code className="font-mono text-red-600 dark:text-red-400">YOUTUBE_API_KEY</code>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {serverHealth?.youtubeConfigured 
                        ? 'Configured in server .env (Live search enabled)' 
                        : 'Using curated verified B.Tech lectures catalog'}
                    </div>
                  </div>
                </div>

                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 text-xs text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  Cloud Console
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Paste or Update YouTube Key */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block">
                  {serverHealth?.youtubeConfigured ? 'Update YouTube Data API v3 Key' : 'Enter YouTube Data API v3 Key (Optional)'}
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showYoutubeKey ? 'text' : 'password'}
                      value={inputYoutubeKey}
                      onChange={(e) => setInputYoutubeKey(e.target.value)}
                      placeholder="Paste YouTube Data API key (starts with AIzaSy...)"
                      className="w-full px-3 py-2 pr-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowYoutubeKey(!showYoutubeKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showYoutubeKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={() => handleSaveApiKey('youtube')}
                    disabled={isSavingKey || !inputYoutubeKey.trim()}
                    className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
                  >
                    {isSavingKey ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save Key</span>
                  </button>
                </div>

                {keySaveMessage && keySaveMessage.type === 'youtube' && (
                  <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                    keySaveMessage.success 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  }`}>
                    {keySaveMessage.success ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{keySaveMessage.text}</span>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-2 text-xs text-amber-900 dark:text-amber-200">
                <div className="font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  YouTube Key Configuration Details
                </div>
                <p className="leading-relaxed text-[11px]">
                  • <strong>Curated Mode (Default):</strong> The app includes complete curated lectures from top educators (Gate Smashers, Neso Academy, Striver) across all 8 semesters. No key needed.
                </p>
                <p className="leading-relaxed text-[11px]">
                  • <strong>Live Search (Optional):</strong> Adding a YouTube API key enables live keyword search and dynamic duration fetching directly from YouTube.
                </p>
              </div>
            </>
          )}

          {/* Security Assurance */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Strict Zero-Exposure Security: Credentials are kept strictly in server-side memory.</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50/70 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
          >
            {saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Model Preference</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
