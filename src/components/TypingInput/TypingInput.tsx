// ================================
// Typing Input Component
// ================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    createTypingState,
    processKeyInput,
    getDisplayState,
    TypingState
} from '@/utils/typing';
import { LearningMode } from '@/types';
import styles from './TypingInput.module.css';

interface TypingInputProps {
    answer: string;
    onComplete: (result: { missCount: number; timeMs: number }) => void;
    onProgress?: (current: number, total: number) => void;
    disabled?: boolean;
    mode: LearningMode;
}

export function TypingInput({
    answer,
    onComplete,
    onProgress,
    disabled = false,
    mode,
}: TypingInputProps) {
    const [typingState, setTypingState] = useState<TypingState>(() =>
        createTypingState(answer)
    );
    const [lastError, setLastError] = useState(false);
    const [hasReported, setHasReported] = useState(false);

    // 連続ミス回数 (Legacy: 2回ミスでヒント)
    const [consecutiveMiss, setConsecutiveMiss] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);

    // 回答が変わったらリセット
    useEffect(() => {
        setTypingState(createTypingState(answer));
        setLastError(false);
        setHasReported(false);
        setConsecutiveMiss(0);
    }, [answer]);

    // 進捗を通知
    useEffect(() => {
        if (onProgress) {
            onProgress(typingState.currentIndex, typingState.normalizedAnswer.length);
        }
    }, [typingState.currentIndex, typingState.normalizedAnswer.length, onProgress]);

    // 完了を通知
    useEffect(() => {
        if (typingState.isComplete && typingState.startTime && !hasReported) {
            setHasReported(true);
            const timeMs = Date.now() - typingState.startTime;
            onComplete({
                missCount: typingState.missCount,
                timeMs,
            });
        }
    }, [typingState.isComplete, typingState.startTime, typingState.missCount, onComplete, hasReported]);

    // キー入力ハンドラ
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (disabled || typingState.isComplete) return;

        // 特殊キーは無視
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key.length !== 1 && e.key !== ' ') return;

        e.preventDefault();

        const inputChar = e.key;
        const newState = processKeyInput(typingState, inputChar);

        // ミス判定
        const isError = inputChar !== typingState.normalizedAnswer[typingState.currentIndex];

        if (isError) {
            setConsecutiveMiss(prev => prev + 1);
        } else {
            setConsecutiveMiss(0);
        }

        setTypingState(newState);

        // エラー表示
        setLastError(isError);

        if (isError) {
            // エラーアニメーション後にリセット
            setTimeout(() => setLastError(false), 300);
        }
    }, [typingState, disabled]);

    // キーボードイベントをリッスン
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // フォーカス管理
    useEffect(() => {
        containerRef.current?.focus();
    }, []);

    const displayState = getDisplayState(typingState);

    // Display Logic
    // Mode 1: Show Guide (Remaining Text) & Current Char
    // Mode 2/3: Hide Guide & Current Char. Reveal next char only if hint triggered.
    const showGuide = mode === 1;
    const isHintTriggered = !showGuide && consecutiveMiss >= 2;

    const visibleCurrentChar = showGuide || isHintTriggered ? displayState.currentChar : '_';

    // Remaining text:
    // Mode 1: Show all
    // Mode 2/3: Show underscores
    const remainingTextDisplay = showGuide
        ? displayState.remainingText
        : '_'.repeat(displayState.remainingText.length);

    return (
        <div
            ref={containerRef}
            className={`${styles.container} ${lastError ? styles.error : ''} ${disabled ? styles.disabled : ''}`}
            tabIndex={0}
            role="textbox"
            aria-label="タイピング入力"
        >
            {/* 入力表示エリア */}
            <div className={styles.display}>
                <span className={styles.completed}>{displayState.completedText}</span>
                <span className={`${styles.current} ${lastError ? styles.shake : ''}`}>
                    {visibleCurrentChar || ''}
                </span>
                <span className={styles.remaining}>
                    {remainingTextDisplay}
                </span>
            </div>

            {/* 入力位置カーソル */}
            <div className={styles.cursor} />

            {/* ミスカウント */}
            {typingState.missCount > 0 && (
                <div className={styles.missCount}>
                    ミス: {typingState.missCount}
                </div>
            )}

            {/* 完了表示 */}
            {typingState.isComplete && (
                <div className={styles.complete}>
                    ✓ 完了！
                </div>
            )}

            {/* ヒント */}
            {!disabled && !typingState.isComplete && (
                <p className={styles.hint}>
                    キーボードで入力してください
                </p>
            )}
        </div>
    );
}

export default TypingInput;
