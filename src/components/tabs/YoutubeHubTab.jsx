import React, { useState, useEffect } from 'react';
import { 
  Play, 
  BookOpen, 
  Clock, 
  User, 
  Search, 
  FileText, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  ExternalLink,
  Bookmark,
  CheckCircle2,
  ListVideo,
  Layers,
  ChevronRight,
  Filter,
  BarChart3,
  Flame,
  Award,
  Video,
  FolderOpen,
  ArrowRight,
  Info,
  AlertTriangle,
  RefreshCw,
  Youtube,
  Grid,
  List
} from 'lucide-react';
import { 
  BTECH_BRANCHES, 
  BTECH_YEARS, 
  BTECH_SEMESTERS, 
  getSubjectsForBranchAndSemester,
  getSubjectDetails,
  searchCurriculum
} from '../../data/btechCurriculum';
import { 
  searchYouTubeLectures, 
  searchYouTubePlaylists 
} from '../../services/youtube';
import { 
  getWatchedLectures, 
  toggleLectureWatched, 
  isLectureWatched,
  getBookmarkedLectures,
  toggleLectureBookmark,
  isLectureBookmarked
} from '../../services/storage';

// ─── Video Player with error/unavailability handling ───────────────────────
function VideoPlayer({ lecture, activeSubject, activeUnitNumber }) {
  const [embedError, setEmbedError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Reset state when video changes
  useEffect(() => {
    setEmbedError(false);
    setLoading(true);
  }, [lecture?.youtubeId]);

  if (!lecture?.youtubeId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
        <Play className="w-10 h-10 opacity-30" />
        <span className="text-sm">Select a lecture to play</span>
      </div>
    );
  }

  if (embedError) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-900 text-white gap-4 p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-600/20 flex items-center justify-center">
          <Youtube className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <div className="font-bold text-sm mb-1">Video Restricted / Unavailable</div>
          <div className="text-xs text-slate-400 mb-4 max-w-xs">
            This video cannot be embedded here. Click below to watch directly on YouTube.
          </div>
          <a
            href={`https://www.youtube.com/watch?v=${lecture.youtubeId}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-semibold transition-colors"
          >
            <Play className="w-4 h-4 fill-current" />
            Watch on YouTube
          </a>
        </div>
        <div className="text-[11px] text-slate-500 mt-2">
          Try a different lecture from the list →
        </div>
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="flex flex-col items-center gap-3 text-white">
            <RefreshCw className="w-8 h-8 animate-spin text-red-500" />
            <span className="text-xs text-slate-400">Loading video...</span>
          </div>
        </div>
      )}
      <iframe
        key={lecture.youtubeId}
        src={`https://www.youtube-nocookie.com/embed/${lecture.youtubeId}?rel=0&modestbranding=1&autoplay=0`}
        title={lecture.title}
        className="absolute inset-0 w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => setLoading(false)}
        onError={() => { setEmbedError(true); setLoading(false); }}
      />
    </>
  );
}

// ─── Lecture card in grid view ─────────────────────────────────────────────
function LectureGridCard({ lec, isSelected, onClick, onToggleWatched, onToggleBookmark }) {
  const id = lec.id || lec.youtubeId;
  const watched = isLectureWatched(id);
  const bookmarked = isLectureBookmarked(id);
  const thumb = lec.thumbnail || `https://img.youtube.com/vi/${lec.youtubeId}/mqdefault.jpg`;

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border cursor-pointer transition-all overflow-hidden group ${
        isSelected
          ? 'ring-2 ring-indigo-500 border-indigo-500 shadow-lg shadow-indigo-500/20'
          : 'border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
      }`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-slate-900 overflow-hidden">
        <img
          src={thumb}
          alt={lec.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = `https://img.youtube.com/vi/${lec.youtubeId}/default.jpg`; }}
        />
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
            <Play className="w-5 h-5 text-white fill-current ml-0.5" />
          </div>
        </div>
        {/* Duration badge */}
        {lec.duration && lec.duration !== 'Lecture' && (
          <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 text-white text-[10px] font-mono rounded">
            {lec.duration}
          </div>
        )}
        {/* Watched badge */}
        {watched && (
          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check className="w-3 h-3 text-white stroke-[3]" />
          </div>
        )}
        {/* Bookmark badge */}
        {bookmarked && (
          <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
            <Bookmark className="w-3 h-3 text-white fill-current" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5 bg-white dark:bg-slate-800">
        <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-tight line-clamp-2 mb-1">
          {lec.title}
        </h5>
        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
          <span className="truncate max-w-[130px]">{lec.channel}</span>
          <div className="flex items-center gap-1.5 shrink-0 ml-1">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleWatched(id); }}
              className={`p-0.5 rounded transition-colors ${watched ? 'text-emerald-500' : 'hover:text-emerald-500'}`}
              title="Toggle Watched"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleBookmark(lec); }}
              className={`p-0.5 rounded transition-colors ${bookmarked ? 'text-indigo-500' : 'hover:text-indigo-500'}`}
              title="Bookmark"
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function YoutubeHubTab({ 
  selectedBranch = 'CSE', 
  setSelectedBranch,
  selectedSemester = 4, 
  setSelectedSemester,
  onAskTutorAboutTopic 
}) {
  // Navigation State
  const [activeBranch, setActiveBranch] = useState(selectedBranch);
  const [activeSemester, setActiveSemester] = useState(selectedSemester);
  const [activeYear, setActiveYear] = useState(() => Math.ceil(selectedSemester / 2));

  // Sync when parent props change
  useEffect(() => { setActiveBranch(selectedBranch); }, [selectedBranch]);
  useEffect(() => { setActiveSemester(selectedSemester); }, [selectedSemester]);

  const changeBranch = (newBranch) => {
    setActiveBranch(newBranch);
    if (setSelectedBranch) setSelectedBranch(newBranch);
  };

  const changeSemester = (newSem, newYear) => {
    setActiveSemester(newSem);
    if (newYear) setActiveYear(newYear);
    if (setSelectedSemester) setSelectedSemester(newSem);
  };

  // Subject & Unit Selection
  const availableSubjects = getSubjectsForBranchAndSemester(activeBranch, activeSemester);
  const [selectedSubjectId, setSelectedSubjectId] = useState(availableSubjects[0]?.id || 'os');
  const activeSubject = availableSubjects.find(s => s.id === selectedSubjectId) || availableSubjects[0] || getSubjectDetails('os');

  const [activeUnitNumber, setActiveUnitNumber] = useState(1);
  const activeUnit = activeSubject?.units?.find(u => u.unitNumber === activeUnitNumber) || activeSubject?.units?.[0];

  // Selected Lecture for Video Player
  const [selectedLecture, setSelectedLecture] = useState(() => {
    return activeUnit?.lectures?.[0] || {
      id: "os-u1-l1",
      youtubeId: "GqeZhCR844I",
      title: "Introduction to Operating Systems",
      channel: "Gate Smashers",
      duration: "17:36",
      notes: "OS manages hardware resources, provides process management, memory management, and I/O control."
    };
  });

  // Dynamic Search & Extra YouTube Results
  const [searchQuery, setSearchQuery] = useState('');
  const [dynamicLectures, setDynamicLectures] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [apiWarning, setApiWarning] = useState(null);
  const [playlists, setPlaylists] = useState([]);

  // View Mode: 'grid' or 'list'
  const [viewMode, setViewMode] = useState('list');

  // Notes & Progress State
  const [notes, setNotes] = useState('');
  const [copiedNotes, setCopiedNotes] = useState(false);
  const [watchedVersion, setWatchedVersion] = useState(0);
  const [bookmarkVersion, setBookmarkVersion] = useState(0);
  const [filterMode, setFilterMode] = useState('all');

  // Sync year when semester changes
  useEffect(() => {
    setActiveYear(Math.ceil(activeSemester / 2));
  }, [activeSemester]);

  // Sync available subjects when branch/sem changes
  useEffect(() => {
    const subs = getSubjectsForBranchAndSemester(activeBranch, activeSemester);
    if (subs.length > 0) {
      setSelectedSubjectId(subs[0].id);
      setActiveUnitNumber(1);
      if (subs[0].units?.[0]?.lectures?.[0]) {
        setSelectedLecture(subs[0].units[0].lectures[0]);
      }
      setDynamicLectures([]);
    }
  }, [activeBranch, activeSemester]);

  // Sync notes when selected lecture changes
  useEffect(() => {
    if (selectedLecture) {
      const saved = localStorage.getItem(`btech_yt_note_${selectedLecture.id || selectedLecture.youtubeId}`);
      setNotes(saved !== null ? saved : selectedLecture.notes || '');
    }
  }, [selectedLecture]);

  // Load playlists for active subject
  useEffect(() => {
    if (activeSubject) {
      searchYouTubePlaylists({ query: `${activeSubject.name} B.Tech course` }).then(res => {
        setPlaylists(res.items || []);
      });
    }
  }, [activeSubject]);

  const handleNoteChange = (newVal) => {
    setNotes(newVal);
    if (selectedLecture) {
      localStorage.setItem(`btech_yt_note_${selectedLecture.id || selectedLecture.youtubeId}`, newVal);
    }
  };

  const handleCopyNotes = () => {
    navigator.clipboard.writeText(notes);
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  const handleDownloadNotes = () => {
    const blob = new Blob([notes], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(selectedLecture?.title || 'Lecture').replace(/[^a-zA-Z0-9]/g, '_')}_Notes.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleWatched = (lectureId) => {
    toggleLectureWatched(lectureId);
    setWatchedVersion(v => v + 1);
  };

  const handleToggleBookmark = (lecture) => {
    toggleLectureBookmark(lecture);
    setBookmarkVersion(v => v + 1);
  };

  // Perform dynamic YouTube Search
  const handlePerformSearch = async (queryText = searchQuery) => {
    if (!queryText.trim()) {
      setDynamicLectures([]);
      setNextPageToken(null);
      setApiWarning(null);
      return;
    }

    setIsSearching(true);
    setDynamicLectures([]);
    const res = await searchYouTubeLectures({ query: queryText, maxResults: 20 });
    setDynamicLectures(res.items || []);
    setNextPageToken(res.nextPageToken || null);
    setApiWarning(res.warning || null);
    setIsSearching(false);
  };

  // Load More Dynamic Results (pagination)
  const handleLoadMore = async () => {
    if (!nextPageToken || isLoadingMore) return;
    setIsLoadingMore(true);
    const res = await searchYouTubeLectures({ 
      query: searchQuery || activeSubject?.name || 'engineering lecture', 
      pageToken: nextPageToken,
      maxResults: 20
    });
    setDynamicLectures(prev => [...prev, ...(res.items || [])]);
    setNextPageToken(res.nextPageToken || null);
    setIsLoadingMore(false);
  };

  // Calculate Subject Completion Progress
  const calculateSubjectProgress = (subject) => {
    if (!subject || !subject.units) return { watched: 0, total: 0, percentage: 0 };
    let totalLectures = 0;
    let watchedCount = 0;

    for (const u of subject.units) {
      if (u.lectures) {
        totalLectures += u.lectures.length;
        for (const l of u.lectures) {
          if (isLectureWatched(l.id || l.youtubeId)) {
            watchedCount++;
          }
        }
      }
    }

    const percentage = totalLectures > 0 ? Math.round((watchedCount / totalLectures) * 100) : 0;
    return { watched: watchedCount, total: totalLectures, percentage };
  };

  const activeProgress = calculateSubjectProgress(activeSubject);

  // Filter Lectures to Display
  const currentUnitLectures = activeUnit?.lectures || [];
  const displayLectures = dynamicLectures.length > 0 ? dynamicLectures : currentUnitLectures;

  const filteredLectures = displayLectures.filter(l => {
    const id = l.id || l.youtubeId;
    if (filterMode === 'bookmarked') return isLectureBookmarked(id);
    if (filterMode === 'unwatched') return !isLectureWatched(id);
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-600/10 via-purple-600/10 to-indigo-600/10 border border-red-500/20 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              <Play className="w-4 h-4 fill-current" />
              Complete 4-Year B.Tech Lecture Library
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              B.Tech Academic Video Hub & Playlist Manager
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Comprehensive 8-Semester syllabus with verified university lectures from <strong className="text-slate-800 dark:text-slate-200">Gate Smashers, Neso Academy, Striver & Abdul Bari</strong> with synchronized notes and learning progress.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {Object.keys(getWatchedLectures()).length} Watched
                </div>
                <div className="text-[10px] text-slate-500">Progress Tracked</div>
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {Object.keys(getBookmarkedLectures()).length} Saved
                </div>
                <div className="text-[10px] text-slate-500">Revision Bookmarks</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Hierarchy Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        {/* Branch Selector */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            Select B.Tech Engineering Branch:
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {BTECH_BRANCHES.map(b => (
              <button
                key={b.id}
                onClick={() => changeBranch(b.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  activeBranch === b.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {b.name} ({b.id})
              </button>
            ))}
          </div>
        </div>

        {/* Year & Semester Grid */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center justify-between">
            <span>Select Academic Year & Semester:</span>
            <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
              Current: Year {activeYear} (Semester {activeSemester})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {BTECH_YEARS.map(y => (
              <div 
                key={y.year} 
                className={`p-2.5 rounded-xl border transition-all ${
                  activeYear === y.year 
                    ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800' 
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Year {y.year}
                </div>
                <div className="flex gap-1.5">
                  {y.semesters.map(sem => (
                    <button
                      key={sem}
                      onClick={() => changeSemester(sem, y.year)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeSemester === sem
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Sem {sem}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center justify-between">
            <span>Subjects for {activeBranch} Semester {activeSemester}:</span>
            <span className="text-[11px] text-slate-500">{availableSubjects.length} Core Subjects</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {availableSubjects.map(sub => {
              const isSelected = sub.id === selectedSubjectId;
              const prog = calculateSubjectProgress(sub);

              return (
                <div
                  key={sub.id}
                  onClick={() => {
                    setSelectedSubjectId(sub.id);
                    setActiveUnitNumber(1);
                    if (sub.units?.[0]?.lectures?.[0]) {
                      setSelectedLecture(sub.units[0].lectures[0]);
                    }
                    setDynamicLectures([]);
                    setSearchQuery('');
                  }}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 border-indigo-600'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {sub.code}
                    </span>
                    <span className={`text-[10px] font-bold ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                      {sub.credits} Credits
                    </span>
                  </div>

                  <h4 className={`text-xs font-bold leading-tight line-clamp-1 ${
                    isSelected ? 'text-white' : 'text-slate-900 dark:text-white'
                  }`}>
                    {sub.name}
                  </h4>

                  <div className="mt-2.5 space-y-1">
                    <div className="flex justify-between text-[10px] opacity-80">
                      <span>Progress</span>
                      <span>{prog.percentage}%</span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                      <div 
                        className={`h-full transition-all ${isSelected ? 'bg-white' : 'bg-indigo-600'}`}
                        style={{ width: `${prog.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePerformSearch()}
            placeholder={`Search ${activeSubject?.name || 'lectures'}, e.g. "Dijkstra", "K-Map", "Normalization"...`}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handlePerformSearch()}
            disabled={isSearching}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-red-500/20 flex items-center justify-center gap-1.5 transition-colors w-full sm:w-auto"
          >
            {isSearching ? (
              <><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span>Searching...</span></>
            ) : (
              <><Play className="w-3.5 h-3.5 fill-current" /><span>Search YouTube</span></>
            )}
          </button>

          {dynamicLectures.length > 0 && (
            <button
              onClick={() => { setDynamicLectures([]); setSearchQuery(''); setNextPageToken(null); setApiWarning(null); }}
              className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* API Warning */}
      {apiWarning && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{apiWarning}</span>
        </div>
      )}

      {/* Main Grid: Video Player + Lecture List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Video Player + Metadata */}
        <div className="lg:col-span-8 space-y-4">
          {/* Video Player */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-xl border border-slate-200 dark:border-slate-800">
            <VideoPlayer
              lecture={selectedLecture}
              activeSubject={activeSubject}
              activeUnitNumber={activeUnitNumber}
            />
          </div>

          {/* Video Metadata */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                  {selectedLecture?.subject || activeSubject?.name}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                  Unit {selectedLecture?.unitNumber || activeUnitNumber}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleWatched(selectedLecture?.id || selectedLecture?.youtubeId)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isLectureWatched(selectedLecture?.id || selectedLecture?.youtubeId)
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isLectureWatched(selectedLecture?.id || selectedLecture?.youtubeId) ? 'Completed' : 'Mark Watched'}</span>
                </button>

                <button
                  onClick={() => handleToggleBookmark(selectedLecture)}
                  className={`p-2 rounded-xl text-xs font-semibold transition-all ${
                    isLectureBookmarked(selectedLecture?.id || selectedLecture?.youtubeId)
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                  title="Bookmark for Revision"
                >
                  <Bookmark className="w-4 h-4" />
                </button>

                {onAskTutorAboutTopic && (
                  <button
                    onClick={() => {
                      const prompt = `Please explain the concept of "${selectedLecture?.title}" from ${activeSubject?.name} with step-by-step explanation, code example, and likely semester exam questions.`;
                      onAskTutorAboutTopic(prompt);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask AI Tutor</span>
                  </button>
                )}
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {selectedLecture?.title}
            </h3>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                {selectedLecture?.channel || 'Verified Academic Educator'}
              </span>
              {selectedLecture?.duration && selectedLecture?.duration !== 'Lecture' && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  {selectedLecture?.duration}
                </span>
              )}
              <a
                href={`https://www.youtube.com/watch?v=${selectedLecture?.youtubeId}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-red-600 dark:text-red-400 hover:underline font-medium"
              >
                Watch on YouTube
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {selectedLecture?.notes && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
                <div className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  Key Academic Takeaways:
                </div>
                <p className="leading-relaxed">{selectedLecture?.notes}</p>
              </div>
            )}
          </div>

          {/* Dynamic Search Results Grid (shown when search is active) */}
          {dynamicLectures.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-red-500" />
                  Search Results
                  <span className="text-xs font-normal text-slate-500">({dynamicLectures.length} videos found)</span>
                </h4>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Grid View"
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                    title="List View"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className={viewMode === 'grid'
                ? "grid grid-cols-2 md:grid-cols-3 gap-3"
                : "space-y-2"
              }>
                {dynamicLectures.map((lec, idx) => {
                  const id = lec.id || lec.youtubeId;
                  const isSelected = (selectedLecture?.id === id || selectedLecture?.youtubeId === lec.youtubeId);

                  if (viewMode === 'grid') {
                    return (
                      <LectureGridCard
                        key={id || idx}
                        lec={lec}
                        isSelected={isSelected}
                        onClick={() => setSelectedLecture(lec)}
                        onToggleWatched={handleToggleWatched}
                        onToggleBookmark={handleToggleBookmark}
                      />
                    );
                  }

                  return (
                    <div
                      key={id || idx}
                      onClick={() => setSelectedLecture(lec)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60 hover:border-slate-300'
                      }`}
                    >
                      <div className="relative w-24 h-14 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                        <img
                          src={lec.thumbnail || `https://img.youtube.com/vi/${lec.youtubeId}/mqdefault.jpg`}
                          alt={lec.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = `https://img.youtube.com/vi/${lec.youtubeId}/default.jpg`; }}
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Play className="w-5 h-5 text-white fill-current" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold leading-tight line-clamp-2 text-slate-900 dark:text-white">{lec.title}</h5>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                          <span className="truncate max-w-[140px]">{lec.channel}</span>
                          <span>{lec.duration || ''}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More button */}
              {nextPageToken && (
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="w-full mt-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span>Loading More...</span></>
                  ) : (
                    <><Play className="w-3.5 h-3.5 text-red-500 fill-current" /><span>Load More YouTube Lectures</span></>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Notes + Lecture List */}
        <div className="lg:col-span-4 space-y-4">
          {/* Notes Editor */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col h-[260px]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Lecture Notes
                </h4>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopyNotes}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Copy Notes"
                >
                  {copiedNotes ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleDownloadNotes}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Download Notes as Markdown"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <textarea
              value={notes}
              onChange={(e) => handleNoteChange(e.target.value)}
              placeholder="Take live notes while watching... Notes auto-save per video!"
              className="flex-1 w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
            />
          </div>

          {/* Unit Tabs & Lecture List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <ListVideo className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                {dynamicLectures.length > 0 ? 'Curated Lectures' : 'Syllabus Lectures'}
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">
                {activeSubject?.units?.length || 5} Units
              </span>
            </div>

            {/* Unit Pills */}
            {dynamicLectures.length === 0 && (
              <div className="grid grid-cols-5 gap-1">
                {(activeSubject?.units || []).map(u => (
                  <button
                    key={u.unitNumber}
                    onClick={() => {
                      setActiveUnitNumber(u.unitNumber);
                      if (u.lectures?.[0]) setSelectedLecture(u.lectures[0]);
                    }}
                    className={`py-1.5 text-center text-xs font-bold rounded-lg transition-all ${
                      activeUnitNumber === u.unitNumber
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    Unit {u.unitNumber}
                  </button>
                ))}
              </div>
            )}

            {/* Current Unit Info */}
            {activeUnit && dynamicLectures.length === 0 && (
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-[11px] space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                  Unit {activeUnit.unitNumber}: {activeUnit.title}
                </div>
                <div className="text-slate-500 dark:text-slate-400 line-clamp-2">
                  Topics: {activeUnit.topics?.join(' • ')}
                </div>
              </div>
            )}

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 text-[11px]">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2 py-1 rounded-lg font-semibold ${
                  filterMode === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                All ({displayLectures.length})
              </button>
              <button
                onClick={() => setFilterMode('bookmarked')}
                className={`px-2 py-1 rounded-lg font-semibold flex items-center gap-1 ${
                  filterMode === 'bookmarked' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Bookmark className="w-3 h-3" />
                Saved
              </button>
              <button
                onClick={() => setFilterMode('unwatched')}
                className={`px-2 py-1 rounded-lg font-semibold ${
                  filterMode === 'unwatched' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                To Watch
              </button>
            </div>

            {/* Lecture Items */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {filteredLectures.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400">
                  No lectures found for this filter. Try "All" or switch unit.
                </div>
              )}
              {filteredLectures.map((lec, idx) => {
                const id = lec.id || lec.youtubeId;
                const isSelected = (selectedLecture?.id === id || selectedLecture?.youtubeId === lec.youtubeId);
                const watched = isLectureWatched(id);
                const bookmarked = isLectureBookmarked(id);

                return (
                  <div
                    key={id || idx}
                    onClick={() => setSelectedLecture(lec)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-950 dark:text-indigo-100 shadow-sm'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60 hover:border-slate-300 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-16 h-11 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                      <img
                        src={lec.thumbnail || `https://img.youtube.com/vi/${lec.youtubeId}/mqdefault.jpg`}
                        alt={lec.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://img.youtube.com/vi/${lec.youtubeId}/default.jpg`;
                          e.target.onerror = null;
                        }}
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Play className="w-4 h-4 text-white fill-current" />
                      </div>
                      {watched && (
                        <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold leading-tight line-clamp-2">
                        {lec.title}
                      </h5>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="truncate max-w-[100px]">{lec.channel}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span>{lec.duration || ''}</span>
                          {bookmarked && <Bookmark className="w-3 h-3 text-indigo-500 fill-current" />}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Load More for curated lectures */}
              {nextPageToken && dynamicLectures.length > 0 && (
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 text-red-500 fill-current" />
                  <span>{isLoadingMore ? 'Loading...' : 'Load More Lectures'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Playlists */}
          {playlists.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <ListVideo className="w-4 h-4 text-red-500" />
                Full Subject Playlists
              </div>
              <div className="space-y-2">
                {playlists.slice(0, 3).map(p => (
                  <a
                    key={p.id}
                    href={`https://www.youtube.com/playlist?list=${p.playlistId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2.5 hover:border-red-500/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-red-600/10 text-red-600 flex items-center justify-center shrink-0">
                      <ListVideo className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-red-600 transition-colors">
                        {p.title}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{p.channel}</div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
