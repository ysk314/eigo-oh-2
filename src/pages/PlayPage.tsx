// ================================
// Play Page
// ================================

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { QuestionDisplay } from '@/components/QuestionDisplay';
import { TypingInput } from '@/components/TypingInput';
import { ProgressBar } from '@/components/ProgressBar';
import { QuestionNav } from '@/components/QuestionNav';
import { TimerBar } from '@/components/TimerBar/TimerBar';
import { ResultCard } from '@/components/ResultCard/ResultCard';
import { getQuestionsBySection, getSectionById } from '@/data/questions';
import { shuffleWithNoConsecutive } from '@/utils/shuffle';
import { soundManager } from '@/utils/sound';
import { UserProgress } from '@/types';
import { calculateScore, ScoreResult } from '@/utils/score';
import { useGameTimer } from '@/hooks/useGameTimer';
import styles from './PlayPage.module.css';

export function PlayPage() {
    const navigate = useNavigate();
    const {
        state,
        updateProgress,
        setQuestionIndex,
        markSectionCleared
    } = useApp();

    const { selectedPart, selectedSection, selectedMode, currentUser, shuffleMode } = state;

    // Load Questions
    const questions = useMemo(() => {
        if (!selectedPart || !selectedSection) return [];
        const section = getSectionById(selectedSection);
        if (!section) return [];
        const baseQuestions = getQuestionsBySection(selectedPart, section.type);
        if (shuffleMode) {
            return shuffleWithNoConsecutive(baseQuestions, (q) => q.answerEn);
        }
        return baseQuestions.sort((a, b) => a.orderIndex - b.orderIndex);
    }, [selectedPart, selectedSection, shuffleMode]);

    // Calculate total characters for timer
    const totalChars = useMemo(() => {
        return questions.reduce((acc, q) => acc + q.answerEn.length, 0);
    }, [questions]);

    // Game State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [sessionResults, setSessionResults] = useState<UserProgress[]>([]);
    const [finalScore, setFinalScore] = useState<ScoreResult | null>(null);
    const [isTimeUp, setIsTimeUp] = useState(false);

    const currentQuestion = questions[currentIndex];

    // Timer Hook
    const handleTimeUp = useCallback(() => {
        setIsTimeUp(true);
        // Force finish logic
        soundManager.playSE('try-again');
        setIsFinished(true); // Triggers result calculation (handled below)
    }, []);

    const { timeLeft, timeLimit, startTimer, stopTimer, resetTimer } = useGameTimer({
        totalChars,
        onTimeUp: handleTimeUp
    });

    // Initialize Check
    useEffect(() => {
        if (!selectedSection || questions.length === 0) {
            navigate('/course');
        } else {
            // Start Timer when questions are ready
            soundManager.init();
            resetTimer(totalChars);
            startTimer();
        }
        return () => stopTimer();
    }, [selectedSection, questions, navigate, totalChars, startTimer, stopTimer, resetTimer]);

    // Question Completion Handler
    const handleQuestionComplete = useCallback((result: { missCount: number; timeMs: number }) => {
        if (!currentQuestion || isTimeUp) return;

        const isCorrect = result.missCount === 0;

        // Save Progress
        updateProgress(currentQuestion.id, {
            attemptsCount: 1,
            correctCount: 1,
            missCount: result.missCount,
        });

        // Add to Session Results
        setSessionResults(prev => [...prev, {
            questionId: currentQuestion.id,
            attemptsCount: 1,
            correctCount: 1,
            missCount: result.missCount,
            clearedMode: selectedMode,
        }]);

        if (isCorrect) {
            soundManager.playSE('success');
        }

        // Next Question or Finish
        setTimeout(() => {
            if (currentIndex < questions.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setQuestionIndex(currentIndex + 1);
            } else {
                finishSession();
            }
        }, 500); // Slightly faster transition
    }, [currentQuestion, currentIndex, questions.length, updateProgress, setQuestionIndex, selectedMode, isTimeUp]);

    // Finish Session
    const finishSession = () => {
        stopTimer();
        setIsFinished(true);
    };

    // Calculate Results when Finished
    // We use a ref to prevent double calculation or re-render loops
    const hasProcessedResult = useRef(false);

    useEffect(() => {
        if (isFinished && !hasProcessedResult.current) {
            hasProcessedResult.current = true;
            stopTimer();

            // Calculate aggregated stats
            const totalMiss = sessionResults.reduce((acc, cur) => acc + cur.missCount, 0);

            // Calculate Score & Rank
            const scoreResult = calculateScore(totalMiss, timeLeft, timeLimit, isTimeUp);
            setFinalScore(scoreResult);

            // Unlock Logic (Rank S required)
            if (scoreResult.rank === 'S') {
                markSectionCleared(selectedSection!, selectedMode);
                soundManager.playSE('fanfare');
            } else {
                if (!isTimeUp) {
                    soundManager.playSE('success'); // General finish
                }
            }
        }
    }, [isFinished, sessionResults, timeLeft, timeLimit, isTimeUp, selectedSection, selectedMode, markSectionCleared, stopTimer]);


    // Handlers needed for Result View
    const handleRetry = () => {
        hasProcessedResult.current = false;
        setCurrentIndex(0);
        setQuestionIndex(0);
        setSessionResults([]);
        setIsFinished(false);
        setIsTimeUp(false);
        setFinalScore(null);

        resetTimer(totalChars);
        startTimer();
    };

    const handleBack = () => {
        const confirm = window.confirm('学習を中断して戻りますか？');
        if (confirm) {
            navigate('/course');
        }
    };

    // --- Render ---

    // 1. Result View
    if (isFinished && finalScore) {
        const totalMiss = sessionResults.reduce((acc, cur) => acc + cur.missCount, 0);
        const totalCorrect = sessionResults.reduce((acc, cur) => acc + cur.correctCount, 0);

        return (
            <div className={styles.page}>
                <Header title="結果発表" showUserSelect={false} />
                <main className={styles.resultMain}>
                    <ResultCard
                        result={finalScore}
                        stats={{
                            correct: totalCorrect,
                            miss: totalMiss,
                            timeLeft: timeLeft
                        }}
                        onRetry={handleRetry}
                        onBack={() => navigate('/course')}
                    />
                </main>
            </div>
        );
    }

    // 2. Play View
    return (
        <div className={styles.page}>
            <header className={styles.playHeader}>
                <button className={styles.backButton} onClick={handleBack}>
                    ← 戻る
                </button>
                <div className={styles.progressContainer}>
                    {/* Timer Bar instead of simple Progress Bar? Or keep both? Keeping both seems useful.
                         Legacy had Bar for Timer. We'll use TimerBar here.
                         Actually legacy design put timer in main area. Let's follow legacy layout roughly but cleaner.
                      */}
                    <div style={{ width: '100%', maxWidth: 600 }}>
                        <TimerBar total={timeLimit} current={timeLeft} />
                    </div>
                </div>
                <div className={styles.userInfo}>
                    {currentUser?.name}
                </div>
            </header>

            <main className={styles.playMain}>
                <div className={styles.navWrapper}>
                    <QuestionNav
                        total={questions.length}
                        current={currentIndex}
                        enableJump={false}
                    />
                </div>

                {currentQuestion ? (
                    <div className={styles.questionArea}>
                        {/* Timer text was here in legacy, but we put it in header/TimerBar component */}

                        <QuestionDisplay
                            question={currentQuestion}
                            mode={selectedMode}
                            autoPlayAudio={state.autoPlayAudio}
                        />

                        <div className={styles.inputArea}>
                            <TypingInput
                                answer={currentQuestion.answerEn}
                                onComplete={handleQuestionComplete}
                                disabled={isFinished || isTimeUp}
                                mode={selectedMode}
                            />
                        </div>
                    </div>
                ) : (
                    <div>Loading...</div>
                )}
            </main>
        </div>
    );
}

export default PlayPage;
