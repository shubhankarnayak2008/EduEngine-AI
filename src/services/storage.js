/**
 * Local Database & State Persistence Layer for B.Tech AI Study Assistant
 * Manages:
 * 1. Chat conversations (Multi-turn sessions, renaming, deletion, export)
 * 2. Learning progress (Watched lectures, completion percentages per subject & semester)
 * 3. Bookmarked lectures and custom study notes
 */

const STORAGE_KEYS = {
  SESSIONS: 'btech_chat_sessions_v2',
  ACTIVE_SESSION: 'btech_active_session_id_v2',
  WATCHED_LECTURES: 'btech_watched_lectures_v2',
  BOOKMARKS: 'btech_bookmarked_lectures_v2',
  STUDY_STREAK: 'btech_study_streak_v2',
};

const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

// ==========================================
// CHAT CONVERSATIONS STORAGE
// ==========================================

export function getChatSessions() {
  if (!isBrowser) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load chat sessions:', e);
    return [];
  }
}

export function saveChatSessions(sessions) {
  if (!isBrowser) return;
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save chat sessions:', e);
  }
}

export function getActiveSessionId() {
  if (!isBrowser) return null;
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION) || null;
}

export function setActiveSessionId(id) {
  if (!isBrowser) return;
  if (id) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, id);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
  }
}

export function createNewSession(initialTitle = 'New Engineering Chat') {
  const newSession = {
    id: 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
    title: initialTitle,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [
      {
        id: 'welcome',
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `### 👋 Namaste & Welcome to your B.Tech AI Study Assistant!

I am **EduEngine AI**, powered by Google Gemini. I am designed specifically for engineering students to master:
- 💡 **Data Structures & Algorithms (DSA)**: Step-by-step logic, code in C++/Java/Python, and Big-O Time & Space analysis.
- ⚙️ **Core CS Subjects**: Operating Systems, DBMS (Normalization 1NF–BCNF), Computer Networks, Theory of Computation.
- 📐 **Engineering Mathematics**: Step-by-step calculus, linear algebra, eigenvalues, Fourier & Laplace transforms.
- 🤖 **AI, ML & Deep Learning**: Neural networks, backpropagation, CNNs, Transformers.
- 📝 **Exam-Oriented Answers**: Definitions, formulas, derivations, circuit/block diagrams, and viva-voce pointers.
- 🌐 **Multilingual Support**: Ask me in **English**, **Hindi (हिंदी)**, or **Hinglish**!

Feel free to attach lecture notes/PDFs, ask for code debugging, or pick a topic to start!`
      }
    ]
  };

  const sessions = getChatSessions();
  const updated = [newSession, ...sessions];
  saveChatSessions(updated);
  setActiveSessionId(newSession.id);
  return newSession;
}

export function updateSessionMessages(sessionId, messages) {
  const sessions = getChatSessions();
  const index = sessions.findIndex(s => s.id === sessionId);
  if (index === -1) return;

  // Auto-generate a title if it's still the default title and user has asked a question
  let title = sessions[index].title;
  if (title === 'New Engineering Chat' || title === 'New Chat') {
    const firstUserMsg = messages.find(m => m.role === 'user');
    if (firstUserMsg && firstUserMsg.content) {
      title = firstUserMsg.content.slice(0, 36).trim() + (firstUserMsg.content.length > 36 ? '...' : '');
    }
  }

  sessions[index] = {
    ...sessions[index],
    title,
    messages,
    updatedAt: new Date().toISOString()
  };

  saveChatSessions(sessions);
}

export function renameSession(sessionId, newTitle) {
  const sessions = getChatSessions();
  const index = sessions.findIndex(s => s.id === sessionId);
  if (index !== -1) {
    sessions[index].title = newTitle.trim() || 'Untitled Chat';
    sessions[index].updatedAt = new Date().toISOString();
    saveChatSessions(sessions);
  }
}

export function deleteSession(sessionId) {
  const sessions = getChatSessions();
  const filtered = sessions.filter(s => s.id !== sessionId);
  saveChatSessions(filtered);
  const activeId = getActiveSessionId();
  if (activeId === sessionId) {
    const nextActive = filtered.length > 0 ? filtered[0].id : null;
    setActiveSessionId(nextActive);
  }
}

// ==========================================
// WATCHED LECTURES & PROGRESS TRACKING
// ==========================================

export function getWatchedLectures() {
  if (!isBrowser) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WATCHED_LECTURES);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch (e) {
    return {};
  }
}

export function toggleLectureWatched(lectureId) {
  if (!isBrowser) return false;
  const watched = getWatchedLectures();
  if (watched[lectureId]) {
    delete watched[lectureId];
  } else {
    watched[lectureId] = {
      watchedAt: new Date().toISOString(),
      timestamp: Date.now()
    };
  }
  localStorage.setItem(STORAGE_KEYS.WATCHED_LECTURES, JSON.stringify(watched));
  return !!watched[lectureId];
}

export function isLectureWatched(lectureId) {
  if (!isBrowser) return false;
  const watched = getWatchedLectures();
  return !!watched[lectureId];
}

// ==========================================
// BOOKMARKS & LECTURE NOTES
// ==========================================

export function getBookmarkedLectures() {
  if (!isBrowser) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch (e) {
    return {};
  }
}

export function toggleLectureBookmark(lecture) {
  if (!isBrowser || !lecture || !lecture.id) return false;
  const bookmarks = getBookmarkedLectures();
  if (bookmarks[lecture.id]) {
    delete bookmarks[lecture.id];
  } else {
    bookmarks[lecture.id] = {
      ...lecture,
      bookmarkedAt: new Date().toISOString()
    };
  }
  localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  return !!bookmarks[lecture.id];
}

export function isLectureBookmarked(lectureId) {
  if (!isBrowser) return false;
  const bookmarks = getBookmarkedLectures();
  return !!bookmarks[lectureId];
}


