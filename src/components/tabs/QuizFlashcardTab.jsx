import React, { useState } from 'react';
import { 
  HelpCircle, 
  Layers, 
  Sparkles, 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  RotateCw, 
  ArrowRight, 
  ArrowLeft, 
  Shuffle, 
  Brain,
  Timer,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateQuizWithGemini } from '../../services/gemini';
import { FLASHCARD_DECKS } from '../../data/mockData';

const POPULAR_QUIZ_TOPICS = [
  "Operating Systems: Semaphores, Deadlocks & Paging",
  "Data Structures: Trees, BST, AVL & Graph Traversal",
  "DBMS: Normalization 1NF to BCNF & ACID Transactions",
  "Computer Networks: TCP/IP, OSI Layers & Subnetting",
  "Engineering Mathematics: Eigenvalues & Linear Algebra"
];

export default function QuizFlashcardTab({ selectedBranch, selectedSemester }) {
  const [activeMode, setActiveMode] = useState('quiz'); // 'quiz' or 'flashcards'

  // Quiz States
  const [customTopic, setCustomTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [qIndex]: optionIndex }
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // Flashcards States
  const [selectedDeck, setSelectedDeck] = useState(FLASHCARD_DECKS[0]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Handle Quiz Generation
  const handleGenerateQuiz = async (topicOverride) => {
    const topic = topicOverride || customTopic || "Operating Systems: Semaphores & Deadlocks";
    setIsGenerating(true);
    setQuizFinished(false);
    setSelectedAnswers({});
    setCurrentQIndex(0);
    setShowExplanation(false);

    try {
      const generated = await generateQuizWithGemini({
        topic,
        numQuestions: 5
      });
      setQuestions(generated);
    } catch (e) {
      console.error("Quiz generation failed:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Option selection
  const handleSelectOption = (optionIndex) => {
    if (selectedAnswers[currentQIndex] !== undefined) return; // already answered
    setSelectedAnswers(prev => ({ ...prev, [currentQIndex]: optionIndex }));
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
      // Trigger confetti celebration!
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) { }
    }
  };

  // Calculate score
  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Mode Switcher Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            AI Quiz & Flashcards Hub
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Test and cement your B.Tech knowledge with instant Gemini quizzes or active recall flipcards
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveMode('quiz')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMode === 'quiz'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Interactive Quiz
          </button>
          <button
            onClick={() => setActiveMode('flashcards')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMode === 'flashcards'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            3D Flashcards
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODE 1: INTERACTIVE MCQ QUIZ                             */}
      {/* ========================================================= */}
      {activeMode === 'quiz' && (
        <div className="space-y-6">
          {/* Topic Generator Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Enter topic or syllabus snippet (e.g. Operating Systems: Semaphores, AVL Trees, BCNF)..."
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => handleGenerateQuiz()}
                disabled={isGenerating}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all shrink-0 cursor-pointer"
              >
                <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Generating with Gemini...' : 'Generate AI Quiz'}
              </button>
            </div>

            {/* Quick Topic Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-[11px] font-semibold text-slate-400">Popular B.Tech Topics:</span>
              {POPULAR_QUIZ_TOPICS.map((topic, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCustomTopic(topic);
                    handleGenerateQuiz(topic);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 text-[11px] font-medium transition-all"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Active Quiz View */}
          {questions.length > 0 && !quizFinished && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
              {/* Progress & Counter */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  Question {currentQIndex + 1} of {questions.length}
                </span>

                <div className="w-32 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Text */}
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                {questions[currentQIndex]?.question}
              </h3>

              {/* Options Grid */}
              <div className="space-y-3">
                {questions[currentQIndex]?.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentQIndex] === optIdx;
                  const isAnswered = selectedAnswers[currentQIndex] !== undefined;
                  const isCorrect = optIdx === questions[currentQIndex].correctIndex;

                  let optionStyle = 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-200';

                  if (isAnswered) {
                    if (isCorrect) {
                      optionStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold';
                    } else if (isSelected) {
                      optionStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200';
                    } else {
                      optionStyle = 'border-slate-200 dark:border-slate-800 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full p-4 rounded-xl text-left text-xs sm:text-sm border transition-all flex items-start justify-between gap-3 ${optionStyle}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {isAnswered && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Answer Explanation */}
              {showExplanation && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1.5 animate-slide-up">
                  <div className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Engineering Explanation:
                  </div>
                  <p className="leading-relaxed">
                    {questions[currentQIndex]?.explanation}
                  </p>
                </div>
              )}

              {/* Next Button */}
              {selectedAnswers[currentQIndex] !== undefined && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                  >
                    <span>{currentQIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quiz Finished View */}
          {quizFinished && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm space-y-5 animate-slide-up">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-orange-500/25">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Quiz Completed!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  You scored <strong className="text-indigo-600 dark:text-indigo-400 text-base">{calculateScore()}</strong> out of <strong className="text-base">{questions.length}</strong> ({Math.round((calculateScore() / questions.length) * 100)}%)
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 max-w-md mx-auto text-xs text-slate-600 dark:text-slate-400">
                {calculateScore() >= 4
                  ? '🎉 Outstanding! You have solid command over these B.Tech exam concepts.'
                  : '💡 Good effort! Review the explanations above or ask the AI Chatbot to reinforce weak areas.'}
              </div>

              <button
                onClick={() => handleGenerateQuiz()}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
                Retake or Generate New Quiz
              </button>
            </div>
          )}

          {questions.length === 0 && !isGenerating && (
            <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 space-y-3">
              <HelpCircle className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
              <div className="font-semibold text-sm text-slate-600 dark:text-slate-400">
                No Quiz Active Yet
              </div>
              <p className="text-xs max-w-md mx-auto">
                Type an engineering subject above or click one of the popular B.Tech topic chips to generate an instant 5-question test!
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 2: 3D FLIPPABLE FLASHCARDS                           */}
      {/* ========================================================= */}
      {activeMode === 'flashcards' && (
        <div className="space-y-6">
          {/* Deck Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>Select B.Tech Deck:</span>
              <select
                value={selectedDeck.id}
                onChange={(e) => {
                  const found = FLASHCARD_DECKS.find(d => d.id === e.target.value);
                  if (found) {
                    setSelectedDeck(found);
                    setCurrentCardIndex(0);
                    setIsCardFlipped(false);
                  }
                }}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
              >
                {FLASHCARD_DECKS.map(deck => (
                  <option key={deck.id} value={deck.id}>{deck.name} ({deck.cards.length} cards)</option>
                ))}
              </select>
            </div>

            <span className="text-xs font-mono text-slate-400">
              Card {currentCardIndex + 1} of {selectedDeck.cards.length}
            </span>
          </div>

          {/* 3D Flippable Card Container */}
          <div className="perspective-1000 max-w-2xl mx-auto h-80 cursor-pointer" onClick={() => setIsCardFlipped(!isCardFlipped)}>
            <div className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${isCardFlipped ? 'rotate-y-180' : ''}`}>
              {/* Front of Card (Question) */}
              <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 border-2 border-indigo-200 dark:border-indigo-900 rounded-3xl p-8 flex flex-col justify-between shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    Question · {selectedDeck.subject}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5" />
                    Click to flip
                  </span>
                </div>

                <div className="my-auto text-center">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                    {selectedDeck.cards[currentCardIndex]?.question}
                  </h3>
                </div>

                <div className="text-center text-xs text-slate-400">
                  Tap to reveal detailed formula & explanation
                </div>
              </div>

              {/* Back of Card (Answer / Explanation) */}
              <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950/40 border-2 border-purple-300 dark:border-purple-900 rounded-3xl p-8 flex flex-col justify-between shadow-xl overflow-y-auto">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    Answer & Concept
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5" />
                    Click to flip back
                  </span>
                </div>

                <div className="my-auto">
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                    {selectedDeck.cards[currentCardIndex]?.answer}
                  </p>
                </div>

                <div className="text-center text-xs text-slate-400">
                  Active Recall: Test yourself before flipping!
                </div>
              </div>
            </div>
          </div>

          {/* Controls: Prev / Flip / Next */}
          <div className="flex items-center justify-center gap-4 max-w-md mx-auto pt-2">
            <button
              onClick={() => {
                setIsCardFlipped(false);
                setCurrentCardIndex(prev => (prev > 0 ? prev - 1 : selectedDeck.cards.length - 1));
              }}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm transition-all cursor-pointer"
              title="Previous Card"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsCardFlipped(!isCardFlipped)}
              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              Flip Card
            </button>

            <button
              onClick={() => {
                setIsCardFlipped(false);
                setCurrentCardIndex(prev => (prev < selectedDeck.cards.length - 1 ? prev + 1 : 0));
              }}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm transition-all cursor-pointer"
              title="Next Card"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
