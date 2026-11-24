# 🎓 EduEngine AI — Smart B.Tech Study Assistant & Engineering Platform

A modern, responsive, and production-ready web application specifically tailored for **B.Tech & Engineering college students**. Powered by **Google Gemini AI**, interactive embedded **YouTube lecture hubs**, automated **quiz & 3D flashcard generators**, and robust **engineering productivity tools**.

---

## 🚀 Key Features

### 1. 🔑 Google Gemini API Integration & Configuration
- **Server-Side Secured Integration**: Secure proxy calls to Google Gemini (`gemini-3.5-flash-lite`, `gemini-3.8-flash`, `gemini-2.0-flash`).
- **Zero-Exposure Credential Architecture**: API keys are maintained strictly in server `.env` and never exposed in browser network requests.
- **Live Connection Testing**: Interactive test button to ping the Gemini API with latency feedback.
- **Fail-Safe Fallback Intelligence**: Built-in comprehensive B.Tech knowledge engine guarantees that college presentations never fail or crash even under network loss or API rate limits.

### 2. 🤖 AI Study Chatbot (Gemini Powered)
- Expert B.Tech academic tutor for **Data Structures & Algorithms, Operating Systems, DBMS, Computer Networks, and Math**.
- Formats mathematical formulas ($\mathcal{O}(N \log N)$, recurrence relations, equations) and code with syntax highlighting.
- 1-Click Code Copy, Conversation Export to Markdown (`.md`), and quick high-yield exam prompt chips.

### 3. 📺 Curated YouTube Lecture Hub
- Filtered by branch (**CSE, IT, AIML, ECE**) and semester (**Sem 1 to 8**).
- Accredited educators (**take U forward / Striver, Gate Smashers, Neso Academy, 3Blue1Brown, Gaurav Sen**).
- **Synchronized Live Note-Taking Editor**: Automatically saves notes to local storage, exports to Markdown, and timestamp chapter bookmarks.

### 4. 🧠 AI Quiz & 3D Flippable Flashcards Generator
- **Interactive Quiz Mode**: Generates 5-10 multiple-choice questions on any syllabus topic with instant score calculation, question-by-question explanations, and confetti victory effects.
- **3D Flippable Flashcards**: Hardware-accelerated CSS 3D cards with active recall questions on the front and formulas/theorems on the back.

### 5. 📑 AI Notes Summarizer & Document Analyzer
- Upload `.txt` or paste dense lecture notes and research papers.
- 4 Output Modes:
  - **Executive Summary**: Core engineering principles & exam pitfalls.
  - **Key Formulas & Bounds**: Time/space complexity, Master theorem, EMAT formulas.
  - **Exam 2-Marker & 5-Marker Q&A**: High-yield university questions with model answers.
  - **Concept Mind-Map Hierarchy**: Structural outline for quick visual recall.

### 6. 🧭 B.Tech Roadmap & Semester Planner
- **Semester 1-8 Syllabus Checklist**: Credit counts, theory/practical tags, and completion tracking.
- **SGPA & Target CGPA Calculator**: Live dynamic calculation ($\sum (Credits \times Grade) / \sum Credits$).
- **Career Tracks**: SDE / FAANG, AI & Machine Learning Engineer, and Full Stack Cloud Architect roadmaps with milestone checkboxes.

### 7. 🛠️ Code & Bug Debugger Assistant
- Multi-language support: **C++, Python, Java, SQL, C**.
- Detects **Segmentation Faults (SIGSEGV), Stack Overflows / Recursion limits, NullPointerExceptions, and Cartesian Joins**.
- Identifies root cause, provides corrected code, and outputs **Time & Space Complexity analysis**.

### 8. ⏱️ Pomodoro Focus Timer & Ambient Audio
- Work/Break intervals (25/5, 50/10, custom).
- **100% Offline Synthesized Web Audio**: Gentle Rain, Warm Lo-Fi Chords, Brownian Noise, and 40Hz Alpha Focus Waves synthesized in real-time via Web Audio API.
- Live browser tab countdown title and session checklist.

### 9. 💼 AI Lab Practical & Placement Resume Helper
- **Formal Lab Record Generator**: Generates title, objective, theoretical background, algorithm, C++ implementation, sample test cases, and **Top 5 Viva-Voce Questions with Answers**.
- **Resume & ATS Optimizer**: Evaluates resume text against target job descriptions, calculates ATS score (0-100%), and rewrites project bullet points using the **Google XYZ formula**.

---

## 💻 Tech Stack
- **Frontend Framework**: React 18 + Vite 5
- **Styling**: Tailwind CSS 3 (Full Dark/Light mode support)
- **Icons**: Lucide React
- **Celebration Effects**: Canvas-Confetti
- **Audio**: HTML5 Web Audio API Synthesizer

---

## 🏃‍♂️ How to Run Locally

```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. Start the development server
npm run dev

# 3. Open in your browser:
# http://localhost:5173
```

---

## 🎤 5-7 Minute College Presentation Script & Demo Guide

1. **Minute 1: Introduction & Problem Statement**
   - *"Engineering students often juggle fragmented tools: YouTube for lectures, Notepad for notes, ChatGPT for explanations, and separate timers. EduEngine AI unifies the entire B.Tech academic lifecycle into one cohesive platform."*
2. **Minute 2: Gemini API Integration & AI Tutor**
   - Show the **Gemini API Configuration Modal** with the pre-loaded key and model selector.
   - Click a quick prompt (e.g. *"Explain Bellman-Ford vs Dijkstra"*) and highlight the code implementation, Big-O complexity, and markdown formatting.
3. **Minute 3: YouTube Hub & Synchronized Notes**
   - Navigate to the **YouTube Lecture Hub**, select an Operating Systems lecture, showcase the embedded player, chapter bookmarks, and live note-taking.
4. **Minute 4: AI Quiz & 3D Flashcards**
   - Click **AI Quiz**, hit *"Generate AI Quiz"*, answer a question to show instant feedback and explanations, then switch to **3D Flashcards** to demonstrate flip animations.
5. **Minute 5: Code Debugger & Lab Practical Helper**
   - Open **Code Debugger**, click *"Showcase Bugs: C++ Dangling Pointer"*, hit *"Analyze & Debug"* to showcase root cause detection and Big-O bounds.
   - Switch to **Lab Helper** to showcase auto-generated lab records and viva-voce questions.
6. **Minute 6: Pomodoro & Career Roadmap**
   - Turn on the **Gentle Rain / Lo-Fi Audio** (synthesized purely in browser), show the SGPA Calculator and Semester 1-8 checklist.
7. **Minute 7: Conclusion & Q&A**
   - Emphasize responsiveness, dark mode, client-side data privacy, and the fail-safe architecture.
